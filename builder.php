#!/usr/bin/php -d display_errors
<?php
declare(ticks = 1);

$builder = null;
pcntl_signal(SIGINT, function() {
    if (!empty($builder)) {
        unset($builder);
    }
    exit;
});

define('INST_PATH', exec('pwd').'/');

class SocketClient {
    public function websocket_open($url){
        $sp = false;
        $key = base64_encode(openssl_random_pseudo_bytes(16));
        $header="GET / HTTP/1.1\r\n"
          ."Host: 127.0.0.1\r\n"
          ."Accept: */*\r\n"
          ."pragma: no-cache\r\n"
          ."cache-control: no-cache\r\n"
          ."Upgrade: WebSocket\r\n"
          ."Connection: Upgrade\r\n"
          ."Sec-WebSocket-Key: $key\r\n"
          ."Sec-WebSocket-Version: 13\r\n"
          ."\r\n";
        $contextOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ],
            'http' => [
                'method' => 'GET'
            ]
        ];
        $context = stream_context_create($contextOptions);
        $sp = stream_socket_client($url, $errno, $errstr, 1, STREAM_CLIENT_CONNECT | STREAM_CLIENT_PERSISTENT, null);
        if(!$sp) return false;
        stream_set_timeout($sp, 1);
        // Ask for connection upgrade to websocket
        if (ftell($sp) === 0):
            fwrite($sp,$header);
            $response_header=fread($sp, 1024);
            if (!strpos($response_header," 101 ") || !strpos($response_header,'Sec-WebSocket-Accept:'))
                return false;
        endif;
        return $sp;
    }

    public function websocket_write($sp, $data,$final=true){
        // Assamble header: FINal 0x80 | Opcode 0x02
        $header=chr(($final?0x80:0) | 0x02); // 0x02 binary
    
        // Mask 0x80 | payload length (0-125) 
        if(strlen($data)<126) $header.=chr(0x80 | strlen($data));  
        elseif (strlen($data)<0xFFFF) $header.=chr(0x80 | 126) . pack("n",strlen($data));
        elseif(PHP_INT_SIZE>4) // 64 bit 
            $header.=chr(0x80 | 127) . pack("Q",strlen($data));
        else  // 32 bit (pack Q dosen't work)
            $header.=chr(0x80 | 127) . pack("N",0) . pack("N",strlen($data));
    
        // Add mask
        $mask=pack("N",rand(1,0x7FFFFFFF));       
        $header.=$mask;
    
        // Mask application data. 
        for($i = 0; $i < strlen($data); $i++)
            $data[$i]=chr(ord($data[$i]) ^ ord($mask[$i % 4]));
    
        return fwrite($sp,$header.$data);    
    }
    
    public function websocket_read($sp,$wait_for_end=true,&$err=''){
        $out_buffer="";
        do{
            // Read header
            $header=fread($sp,2);
            if(!$header) return false;
            $opcode = ord($header[0]) & 0x0F;
            $final = ord($header[0]) & 0x80;
            $masked = ord($header[1]) & 0x80;
            $payload_len = ord($header[1]) & 0x7F;
            // Get payload length extensions
            $ext_len = 0;
            if($payload_len >= 0x7E):
                $ext_len = 2;
                if($payload_len == 0x7F) $ext_len = 8;
                if(!($ext = fread($sp,$ext_len))) return false;
        
                // Set extented paylod length
                $payload_len= 0;
                for($i=0;$i<$ext_len;$i++) 
                    $payload_len += ord($header[$i]) << ($ext_len-$i-1)*8;

            endif;

            // Get Mask key
            if($masked):
                $mask=fread($sp,4);
                if(!$mask) return false;
            endif;

            // Get payload
            $frame_data='';
            do {
                if(!($frame= fread($sp,$payload_len))) return false;
                $payload_len -= strlen($frame);
                $frame_data.=$frame;
            } while($payload_len>0);    
            // if opcode ping, reuse headers to send a pong and continue to read
            if($opcode === 9):
                // Assamble header: FINal 0x80 | Opcode 0x02
                $header[0]=chr(($final?0x80:0) | 0x0A); // 0x0A Pong
                fwrite($sp,$header.$ext.$mask.$frame_data);
            // Recieve and unmask data
            elseif($opcode<3):
                $data = '';
                $data_len = strlen($frame_data);
                if($masked):
                    for ($i = 0; $i < $data_len; $i++) 
                        $data .= $frame_data[$i] ^ $mask[$i % 4];
                else:
                    $data .= $frame_data;
                    $out_buffer.=$data;
                endif;
            endif;
          // wait for Final 
        } while($wait_for_end && !$final);

        return $out_buffer;
    }
}

class Builder {
    private $_configs = null;
    public $shellOutput = true;
    private $_command = null;
    private $_commands = [
        'watch',
        'build',
        'test',
        'server',
        'socket'
    ];

    // private $_colorMsg = null;
    private $_currClientIp = '127.0.0.1';
    private $_defaultIp = '127.0.0.1';
    private $_host = 'localhost';
    private $_port = 4895;
    private $_thick_functions = ['_ping'];
    private $_clients = [];
    private $_start = 0;
    private $_server = null;
    private $_onconnect_functions = [];
    private $_pingStart = 0;
    private $_filesToWatch = [];
    private $_pingTime = 45;
    private $_SC = null;
    private $_socketPipe = false;
    public $keep_listening = true;

    private function _logger($source, $message) {
        if (empty($source) or empty($message) or !is_string($source) or !is_string($message)):
            return false;
        endif;
        $logdir = INST_PATH.'tmp/logs/';
        is_dir($logdir) or mkdir($logdir, 0777, true);
        $file = "{$source}.log";
        $stamp = date('d-m-Y h:i:s');

        file_exists("{$logdir}{$file}")
            and filesize("{$logdir}{$file}") >= 524288000
            and rename("{$logdir}{$file}", "{$logdir}{$stamp}_{$file}");
        $this->shellOutput and fwrite(STDOUT, "{$message}\n");
        $this->shellOutput or file_put_contents("{$logdir}{$file}", "[{$stamp}] - {$message}\n", FILE_APPEND);
        return true;
    }

    private function _readFiles($path, $pattern, $goUnder = true) {
        $files = [];
        $dir = opendir($path);
        //first level, not subdirectories
        while(false !== ($file = readdir($dir))):
            $file !== '.'
                and $file !== '..'
                and is_file("{$path}{$file}")
                and preg_match($pattern, $file, $matches) === 1
                and ($files[] = "{$path}{$file}");
        endwhile;
        closedir($dir);
        //Second level, subdirectories
        if ($goUnder):
            $dir = opendir($path);
            while(false !== ($file = readdir($dir))):
                $npath = "{$path}{$file}";
                if ($file !== '.' and $file !== '..' and is_dir($npath) and is_readable($npath)):
                    $dir1 = opendir("{$path}{$file}");
                    if(false !== $dir1):
                        while(false !== ($file1 = readdir($dir1))):
                            is_file("{$path}{$file}/{$file1}")
                            and preg_match($pattern, $file1, $matches) === 1
                            and ($files[] = "{$path}{$file}/{$file1}");
                        endwhile;
                        closedir($dir1);
                    endif;
                endif;
            endwhile;
            closedir($dir);
        endif;
        sort($files);

        return $files;
    }

    private function _cleanJS($code) {
        $pattern = '/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\')\/\/.*))/';
        $code = preg_replace($pattern, '', $code);
        $search = [
            '/\>[^\S ]+/s',     // strip whitespaces after tags, except space
            '/[^\S ]+\</s',     // strip whitespaces before tags, except space
           '/(\s)+/s',         // shorten multiple whitespace sequences
            '/<!--(.|\s)*?-->/' // Remove HTML comments
        ];
        $replace = [
            '>',
            '<',
            '\\1',
            ''
        ];
        return preg_replace($search, $replace, $code);
    }

    public function sass() {
        $sass = new Sass();
        $sass->setStyle(Sass::STYLE_COMPRESSED);
        $files = $this->_readFiles($this->_configs->source, '/(.+)\.scss/');
        array_unshift($files, "{$this->_configs->source}/styles.scss");
        $bigFile = '';
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $bigFile .= file_get_contents($file)."\n";
            endwhile;
        endif;
        $css = $sass->compile($bigFile);
        file_put_contents("{$this->_configs->target}dmb-styles.css", $css);
    }

    public function setspecs() {
        $files = $this->_readFiles($this->_configs->source, '/^(?=.*\.spec).+\.js$/');

        $bigFile = '';
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $bigFile .= file_get_contents($file)."\n";
            endwhile;
        endif;

        file_put_contents("{$this->_configs->tests}specs.min.js", $bigFile);
    }

    public function buildDirectives() {
        $files = $this->_readFiles($this->_configs->source, '/^(?=.*\.directive)(?!.*?\.spec).+\.js$/');
        file_exists("{$this->_configs->target}dmb-components.min.js")
            and unlink("{$this->_configs->target}dmb-components.min.js");
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $file = $this->_cleanJS($file);
                file_put_contents(
                    "{$this->_configs->target}dmb-components.min.js",
                    file_get_contents($file)."\n", FILE_APPEND
                );
            endwhile;
        endif;
    }

    public function buildFactories() {
        $files = $this->_readFiles($this->_configs->source, '/^(?=.*\.factory)(?!.*?\.spec).+\.js$/');
        file_exists("{$this->_configs->target}dmb-factories.min.js")
            and unlink("{$this->_configs->target}dmb-factories.min.js");
        $classes = [];
        $requires = [];
        $fileClases = [];
        $filesToBuild = [];
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $fp = fopen($file, 'r');
                while(!feof($fp)):
                    $line = fread($fp, 1024);
                    preg_match('@class[\s]+([\w]+)[\s]+(?:extends[\s]+([\w]+))?@mix', $line, $matches);
                    if(!empty($matches[1])):
                        if(!empty($matches[2])):
                            $requires[$matches[1]] = $matches[2];
                        endif;
                        $classes[] = $matches[1];
                        $fileClases[$matches[1]] = $file;
                        break;
                    endif;
                endwhile;
                fclose($fp);
            endwhile;

            foreach($fileClases as $class => $file):
                if(!empty($requires[$class])):
                    $required = $requires[$class];
                    $filesToBuild[$required] = $fileClases[$required];
                    $fileClases[$required] = null;
                    unset($fileClases[$required]);
                endif;
                if(!empty($fileClases[$class]) and empty($filesToBuild[$class])):
                    $filesToBuild[$class] = $fileClases[$class];
                    $fileClases[$class] = null;
                    unset($fileClases[$class]);
                endif;
            endforeach;

            while (null !== ($file = array_shift($filesToBuild))):
                file_put_contents(
                    "{$this->_configs->target}dmb-factories.min.js",
                    file_get_contents($file)."\n",
                    FILE_APPEND
                );
            endwhile;
        endif;
    }

    private function _buildConfigs() {
        $this->_configs = new stdClass();
        $configFile = file_get_contents(INST_PATH.'dumbojs.conf.json');
        if ($configFile !== false):
            $conf = json_decode($configFile);
            $this->_configs->source = realpath($conf->src).'/';
            $this->_configs->target = realpath($conf->target).'/';
            $this->_configs->tests = realpath($conf->tests).'/';
        else:
            $this->_configs->source = INST_PATH.'src/';
            $this->_configs->target = INST_PATH.'dist/';
            $this->_configs->tests = INST_PATH.'tests/';
        endif;
    }

    public function __construct() {
        $this->_buildConfigs();
        $this->_SC = new SocketClient();
    }
    public function setDumboMain() {
        //fo further actions, this section can handle obfuscation or more things
        copy("{$this->_configs->source}dumbo.js", "{$this->_configs->target}dumbo.min.js");
    }
    private function _setFilesToWatch() {
        if (empty($this->_filesToWatch)):
            $this->_logger('dumbo_ui_watcher', 'Setting up files for watch...');
            $list = [
                ...$this->_readFiles("{$this->_configs->source}", '/(.+)\.js/'),
                ...$this->_readFiles("{$this->_configs->source}", '/(.+)\.scss/'),
                ...$this->_readFiles($this->_configs->source, '/(.+)\.scss/', false)
            ];
            $this->_logger('dumbo_ui_watcher', "Watching for changes in files: \n".implode("\n", $list));

            foreach($list as $file):
                $stats = stat($file);
                $this->_filesToWatch[] = ['path'=> $file, 'mtime' => $stats['mtime']];
            endforeach;
        endif;
        $this->_logger('dumbo_ui_watcher', 'Watching files...');
    }
    public function buildUI() {
        $this->sass();
        $this->setDumboMain();
        $this->buildFactories();
        $this->buildDirectives();
        $this->setspecs();
        $this->setTestPage();
        // empty($this->_filesToWatch) and $this->_setFilesToWatch();

        // $this->_options['watch']['value'] && $this->watchUIAction();
    }
    public function setTestPage() {
        $this->_logger('dumbo_ui_builder', 'Building files...');
        $start = microtime(true);

        $dumbojs = file_get_contents("{$this->_configs->source}dumbo.js");
        $dmbfactsjs = file_get_contents("{$this->_configs->target}dmb-factories.min.js");
        $dmbcompsjs = file_get_contents("{$this->_configs->target}dmb-components.min.js");
        $specsjs = file_get_contents("{$this->_configs->tests}specs.min.js");
        $dumbocss = file_get_contents("{$this->_configs->target}dmb-styles.css");
        $jasminelib = file_get_contents('jasmine/jasmine.js');
        $jasminehtml = file_get_contents('jasmine/jasmine-html.js');
        $jasmineboot = file_get_contents('jasmine/jasmine-boot.js');
        $jasminecss = file_get_contents('jasmine/jasmine.css');
        $page = <<<DUMBO
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Dumbo UI tests</title>
    <style type="text/css">
    :root {
        --primary: #16253F;
        --primary-contrast: #FFFFFF;
        --primary-hover: #16253F99;
        --secondary: #182517;
        --secondary-contrast: #E7DAE7;
        --secondary-hover: #E8EBEF;
        --default: #27401D;
        --default-contrast: #FFFFFF;
        --default-hover: #99999999;
        --error: #F44336;
        --error-contrast: #FFFFFF;
        --error-hover: #F4433699;
        --success: #63AB71;
        --success-contrast: #15253E;
        --success-hover: #63AB7199;
        --warning: #E09B39;
        --warning-contrast: #FFFFFF;
        --warning-hover: #E09B3999;
        --information: #51697C;
        --information-contrast: #B8E2F5;
        --information-hover: #51697C;
        --hover-opacity: 0.5;
    }

    {$dumbocss}

    {$jasminecss}
    </style>
</head>
<body>
        <div class="jasmine_html-reporter jasmine_failure-list">
            <div class="jasmine-banner"></div>
            <ul class="jasmine-symbol-summary"></ul>
            <div class="jasmine-alert"></div>
            <div class="jasmine-results"></div>
        </div>
        <div id="components">
        </div>
        <script type="text/javascript">
            const sock = new WebSocket('ws://localhost:4895');

            sock.onopen = () => {
                console.info('connected');
                sock.send(JSON.stringify({ action: 'register', value: '123456' }));
                setTimeout(() => {
                    sendResults();
                }, 1000);
            };
    
            sock.onmessage = (e) => {
                let data = JSON.parse(e.data);
                switch (data.action) {
                    case 'refresh':
                        console.info(data.message);
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    break;
                    default:
                        console.info(data.action);
                    break;
                }
            };

            function sendResults() {
                const results = document.querySelector('.jasmine_html-reporter');
                const duration = results.querySelector('.jasmine-duration');
                const overall = results.querySelector('.jasmine-overall-result');
                const data = {
                    action: 'test-results', result: `\${duration.innerHTML} - \${overall.innerText}`
                };

                sock.send(JSON.stringify(data));

                setTimeout(() => {
                    window.open('', '_self').close();
                }, 10000);
            }
        </script>
        <script type="text/javascript">
            {$dumbojs}
        </script>
        <script type="text/javascript">
            {$dmbfactsjs}
        </script>
        <script type="text/javascript">
            {$dmbcompsjs}
        </script>

        <script type="text/javascript">
        {$jasminelib}
        </script>
        <script type="text/javascript">
        {$jasminehtml}
        </script>
        <script type="text/javascript">
        {$jasmineboot}
        </script>
        <script type="text/javascript">
            {$specsjs}
        </script>
</body>
</html>
DUMBO;

        file_put_contents("{$this->_configs->tests}test.html",$page);
        $total = microtime(true) - $start;
        $this->_logger('dumbo_ui_builder', "Jobs finished, took {$total} seconds.");
    }

    public function testUI() {
        $descriptorspec = [
            ['pipe', 'r'],
            ['pipe', 'w'],
            ['file', '/tmp/error-output.txt', 'a'],
        ];
        $cwd = '/tmp';
        $env = [];
        $command =<<<DUMBO
/opt/google/chrome/chrome \\
--headless \\
--disable-gpu \\
--repl \\
--run-all-compositor-stages-before-draw \\
--virtual-time-budget=10000 \\
file://{$this->_configs->tests}test.html
DUMBO;

        $process = proc_open($command, $descriptorspec, $pipes, $cwd, $env);
        if(is_resource($process)):
            $script = <<<DUMBO
let results = document.querySelector('.jasmine_html-reporter'),
duration = results.querySelector('.jasmine-duration'),
overall = results.querySelector('.jasmine-overall-result'),
data = `\${duration.innerHTML} - \${overall.innerText}`;
data;
DUMBO;
            $script = str_replace("\n", '', $script);
            fwrite($pipes[0], $script);
            fclose($pipes[0]);
            $output = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            proc_close($process);
            preg_match('@\{(?:.)+\}@', $output, $matches);
            $result = json_decode($matches[0])->result->result;
            preg_match('@((?:\d)+)\sfailures@', $result->value, $matches);
            $errors = !empty($errors);
            $this->_logger('dumbo_ui_unit_testing', $result->value);
            (bool)$errors and fwrite(STDERR, "{$matches[0]}\n");
        endif;
    }

    private function _watchUI() {
        foreach($this->_filesToWatch as  $index => $file):
            $stats = stat($file['path']);
            if($stats['size'] > 0 and $file['mtime'] !== $stats['mtime']):
                $this->_logger('dumbo_ui_watcher', "File changed {$file['path']}");
                $this->_filesToWatch[$index]['mtime'] = $stats['mtime'];
                $this->_logger('dumbo_ui_watcher', 'Runing tasks...');
                $start = microtime(true);
                $this->buildUI();
                $total = microtime(true) - $start;
                $this->_logger('dumbo_ui_watcher', "Jobs finished, took {$total} seconds.");
                $response = ['action' => 'refresh', 'message' => 'UI source files updated. Refreshing...'];
                $encoded = json_encode($response);
                $this->_logger('dumbo_ui_watcher', "Sending message to socket.");
                $this->_socket_send_message($encoded);
                break;
            endif;
        endforeach;
    }

    public function run($argv) {
        if(empty($argv[1])):
            die('Error: Option not valid.');
        endif;

        array_shift($argv);
        $this->_command = array_shift($argv);

        switch($this->_command):
            case 'watch':
                $this->_watchUI();
            break;
            case 'build':
                $this->buildUI();
            break;
            case 'test':
                $this->testUI();
            break;
            case 'server':
                $this->_launchEverything();
            break;
            case 'socket':
                $this->_launchSocket();
            break;
            default:
                die('Error: Option not valid.');
        endswitch;
    }

    // socket section
    private function _socket_server() {
        error_reporting(E_ALL);
        set_time_limit(0);
        ob_implicit_flush();
        extension_loaded('sockets') or die('The sockets extension is not loaded.');

        try {
            $this->_start = time();
            if(!($this->_server = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)))
                throw new Exception('Unable to create AF_UNIX socket: '. socket_strerror(socket_last_error()));
            if(!socket_set_option($this->_server, SOL_SOCKET, SO_REUSEADDR, 1))
                throw new Exception('Unable to set socket option: '. socket_strerror(socket_last_error($this->_server)));

            if(!socket_bind($this->_server, 0, $this->_port))
                throw new Exception('Unable to bind socket: '. socket_strerror(socket_last_error($this->_server)));

            if(!socket_listen($this->_server))
                throw new Exception('Unable to listen socket: '. socket_strerror(socket_last_error($this->_server)));

            $this->_logger('dumbo_socket_server', 'Socket binded, starting to listen...');
            $serverPos = ['server' => $this->_server];
            do {
                $changed = array_merge([$this->_server], $this->_clients);
                $select = socket_select($changed, $null, $null, $sec = 0);
                if(false === $select) throw new Exception('Unable to select socket: '. socket_strerror(socket_last_error($this->_server)));
                if (in_array($this->_server, $changed)):
                    if(false === ($socket_new = socket_accept($this->_server))) throw new Exception('Unable to accept socket: '. socket_strerror(socket_last_error($this->_server))); //accpet new socket

                    $header = socket_read($socket_new, 1024);
                    $this->_socket_handshake($header, $socket_new);
                    $ip = $this->_currClientIp;
                    $this->_socket_register($socket_new, $ip);
                    $this->_logger('dumbo_socket_server', "New connection from {$ip} stablished.");
                    $this->_logger('dumbo_socket_server', 'Connected users: '. sizeof($this->_clients));
                endif;
                if ($select > 0):
                    if(false === ($socket_new = socket_accept($this->_server))) throw new Exception('Unable to accept socket: '. socket_strerror(socket_last_error($this->_server))); //accpet new socket

                    $header = socket_read($socket_new, 1024);
                    $this->_socket_handshake($header, $socket_new);
                    $this->_socket_read_messages($socket_new);
                endif;
                if(time() - $this->_start >= 1):
                    $methods = $this->_thick_functions;
                    while(null !== ($method = array_shift($methods))):
                        $this->{$method}();
                    endwhile;
                    $this->_start = time();
                endif;
            } while ($this->keep_listening);
        } catch (Exception $e) {
            $this->_logger('dumbo_socket_server', "Error on socket server: {$e}");
        }
    }

    private function _socket_read_messages(Socket $target = null): void {
        $data = null;
        $this->_logger('dumbo_socket_server', "Attempt to read changes from soket");

        // do {
            if (false === ($buf = socket_read($target, 1024))):
                $this->_logger('dumbo_socket_server', 'Socket_read failed on register, reason: '.socket_strerror(socket_last_error($target)));
                // break;
            endif;
            if (strlen($buf) > 2):
                $msg = $this->_unmask($buf);
                $data = json_decode($msg);
                if (is_object($data) and isset($data->action)):
                    switch($data->action):
                        case 'test-results':
                            $this->_logger('dumbo_socket_server', "Results of the tests: {$data->result}");
                            fwrite(STDOUT, $data->result);
                        break;
                        case 'stop':
                            $this->_logger('dumbo_socket_server', 'Stopping server');
                            $this->keep_listening = false;
                            // break 2;
                        break;
                    endswitch;
                    // break;
                endif;
            endif;
        // } while($this->keep_listening);
    }

    private function _socket_register($client, $ip) {
        $pos = '';
        $data = null;
        $this->_logger('dumbo_socket_server', "Attempt to register a new client from {$ip}");
        $keep = true;

        // do {
            if (false === ($buf = socket_read($client, 2048))):
                $this->_logger('dumbo_socket_server', 'Socket_read failed on register, reason: '.socket_strerror(socket_last_error($client)));
                // break;
            endif;
            if (strlen($buf) > 2):
                $msg = $this->_unmask($buf);
                $data = json_decode($msg);

                if (is_object($data) and isset($data->action)):
                    switch($data->action):
                        case 'register':
                            if(!empty($data->value)):
                                $pos = md5($ip.$data->value);
                                $this->_clients[$pos] = $client;
                                $this->_logger('dumbo_socket_server', "New client registered with pos: {$pos}");
                                $methods = $this->_onconnect_functions;
                                while(!!($method = array_shift($methods))):
                                    $this->{$method}($pos, $ip, $data->value);
                                endwhile;
                                if($data->value === 'test') $this->_pingTime = 1;
                                $location = ['action'=>'register', 'pos'=>$pos];
                                $this->_socket_send_message(json_encode($location), [$client]);
                                $keep = false;
                            endif;
                        break;
                    endswitch;
                    // break;
                endif;
            endif;
        // } while($keep);
    }

    // private function _check_devices() {
    //     $response['data'] = $this->Device->Find(['fields'=>'id, status, updated_at']);
    //     $tmp = [...$response['data']];
    //     while(!!($device = array_shift($tmp))):
    //         ($this->_start - $device->updated_at > 120) and !empty($device->status) and !($device->status = 0) and $device->Save();
    //     endwhile;
    //     $response['action'] = 'devices';
    //     $encoded = json_encode($response);
    //     $hash = md5($encoded);
    //     $hash === $this->_hash or ($this->_socket_send_message($encoded) and ($this->_hash = $hash));
    // }

    private function _socket_send_message($msg, array $target = null) {
        $target = $target ?? $this->_clients;
        $msg = $this->_mask($msg);
        $temp = $target ?? [];
        while(null !== ($socket = array_shift($temp))):
            $this->_logger('dumbo_socket_server_write', "Attempt to write in socket: {$msg}");
            if(false === socket_write($socket, $msg, strlen($msg))):
                $this->_logger('dumbo_socket_server', 'Removing inactive socket.');
                if (in_array($socket, $this->_clients)):
                    $pos = array_search($socket, $this->_clients);
                    $this->_clients[$pos] = null;
                    unset($this->_clients[$pos]);
                endif;
                socket_close($socket);
            endif;
        endwhile;
        return true;
    }

    private function _unmask($text) {
        $length = ord($text[1]) & 127;

        switch($length):
            case 126:
                $masks = substr($text, 4, 4);
                $data = substr($text, 8);
            break;
            case 127:
                $masks = substr($text, 10, 4);
                $data = substr($text, 14);
            break;
            default:
                $masks = substr($text, 2, 4);
                $data = substr($text, 6);
            break;
        endswitch;

        $text = '';
        for ($i = 0; $i < strlen($data); ++$i) {
            $text .= $data[$i] ^ $masks[$i%4];
        }
        return $text;
    }

    private function _mask($text) {
        $b1 = 0x80 | (0x1 & 0x0f);
        $length = strlen($text);

        if($length <= 125)
            $header = pack('CC', $b1, $length);
        elseif($length > 125 && $length < 65536)
            $header = pack('CCn', $b1, 126, $length);
        elseif($length >= 65536)
            $header = pack('CCNN', $b1, 127, $length);
        return $header.$text;
    }

    private function _socket_handshake($recieved_header, $client_conn) {
        $headers = [];
        $this->_logger('dumbo_socket_server', 'Performing handshake.');
        $lines = preg_split("/\r\n/", $recieved_header);
        while(null !== ($line = array_shift($lines))):
            $line = chop($line);
            if(preg_match('/\A(\S+): (.*)\z/', $line, $matches))
                $headers[$matches[1]] = $matches[2];
        endwhile;
        $this->_currClientIp = $headers['X-RealIP'] ?? $this->_defaultIp;
        $secKey = $headers['Sec-WebSocket-Key'];
        $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        //hand shaking header
        $upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
        "Upgrade: websocket\r\n" .
        "Connection: Upgrade\r\n" .
        "WebSocket-Origin: {$this->_host}\r\n" .
        "WebSocket-Location: wss://{$this->_host}:{$this->_port}\r\n".
        "Sec-WebSocket-Accept:$secAccept\r\n\r\n";
        socket_write($client_conn,$upgrade,strlen($upgrade));
        $this->_logger('dumbo_socket_server', 'Handshake with upgrade done.');
    }

    private function _ping() {
        empty($this->_pingStart) and ($this->_pingStart = time());
        $message = [
            'action' => 'ping'
        ];
        if((time() - $this->_pingStart) >= $this->_pingTime):
            $this->_pingStart = time();
            $encoded = json_encode($message);
            $this->_socket_send_message($encoded);
        endif;
    }

    private function _launchSocket() {
        $this->_logger('dumbojs_builder', 'Starting demon socket...');
        $this->buildUI();
        // $this->_thick_functions[] = '_watchUI';
        $this->_socket_server();
    }
    // end socket section

    private function _launchEverything() {
        $this->_checkSocket();

        $descriptorspec = [
            ['pipe', 'r'],
            ['pipe', 'w'],
            ['file', '/tmp/dumboui-error-output.txt', 'a'],
        ];
        $cwd = './';
        $env = [];
        $command =<<<DUMBO
/opt/google/chrome/chrome \\
--headless=new \\
--enable-chrome-browser-cloud-management \\
--disable-gpu \\
--disable-extensions \\
--disable-gpu-sandbox \\
--disable-workspace-trust \\
--disable-translate \\
--repl \\
{$this->_configs->tests}test.html
DUMBO;
        echo $command;
        // sleep(2);
        system($command);
//         $result = $this->_SC->websocket_read($this->_socketPipe);
//         $this->_logger('dumbojs_server_socket', $result);
        // $process = proc_open($command, $descriptorspec, $pipes, $cwd, $env);
        // if(is_resource($process)):
        //     fclose($pipes[0]);
        //     $output = stream_get_contents($pipes[1]);
        //     // fclose($pipes[1]);
        //     // proc_close($process);
        // endif;
        // // $this->_launchSocket();
    }

    private function _checkSocket() {
        if (false === $this->_socketPipe):
            $this->_socketPipe = $this->_SC->websocket_open("{$this->_host}:{$this->_port}");
        endif;
        
        if(false === $this->_socketPipe):
            $this->_logger('dumbojs_server_socket', 'Socket offline, turning socket online.');
            system('./builder.php socket > /dev/null 2>/dev/null &');
            // waits for server socket to up and run
            sleep(5);
            $this->_socketPipe = $this->_SC->websocket_open("{$this->_host}:{$this->_port}");
            if (false === $this->_socketPipe):
                throw new Exception('socket server is not able to run.');
            endif;
            $message = '{"action": "register", "value":"123456789"}';
            $bytes = $this->_SC->websocket_write($this->_socketPipe, $message);
        endif;
        $this->_logger('dumbojs_server_socket', "Socket online.");
    }

    public function __destruct() {
        $this->_socketPipe = $this->_SC->websocket_open("{$this->_host}:{$this->_port}");
        if(false !== $this->_socketPipe):
            fwrite(STDOUT, "Stopping socket server...\n");
            $message = '{"action": "stop", "value":"123456"}';
            $bytes = $this->_SC->websocket_write($this->_socketPipe, $message);
            fwrite(STDOUT, "Bytes written: {$bytes}\n");
            fclose($this->_socketPipe);
            unset($this->_SC);
        endif;
    }

}

$builder = new Builder();
$builder->run($argv);
