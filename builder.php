#!/usr/bin/php -d display_errors
<?php
$dir = dirname(realpath(__FILE__));
$pathArray = explode('/', $dir);
define('INST_PATH', implode('/',$pathArray).'/');

class Builder {
    private $_configs = null;
    public $shellOutput = true;
    private $_command = null;
    private $_commands = [
        'watch',
        'build',
        'test'
    ];

    private function _logger($source, $message) {
        if (empty($source) or empty($message) or !is_string($source) or !is_string($message)):
            return false;
        endif;
        $logdir = INST_PATH.'tmp/logs/';
        is_dir($logdir) or mkdir($logdir, 0777, true);
        $file = "{$source}.log";
        $stamp = date('d-m-Y i:s:H');

        file_exists("{$logdir}{$file}") and filesize("{$logdir}{$file}") >= 524288000 and rename("{$logdir}{$file}", "{$logdir}{$stamp}_{$file}");
        $this->shellOutput and fwrite(STDOUT, "{$message}\n");
        file_put_contents("{$logdir}{$file}", "[{$stamp}] - {$message}\n", FILE_APPEND);
        return true;
    }

    private function _readFiles($path, $pattern, $goUnder = true) {
        $files = [];
        $dir = opendir($path);
        //first level, not subdirectories
        while(false !== ($file = readdir($dir))):
            $file !== '.' and $file !== '..' and is_file("{$path}{$file}") and preg_match($pattern, $file, $matches) === 1 and ($files[] = "{$path}{$file}");
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
                            is_file("{$path}{$file}/{$file1}") and preg_match($pattern, $file1, $matches) === 1 and ($files[] = "{$path}{$file}/{$file1}");
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
        $sass->setStyle(Sass::STYLE_EXPANDED);
        $files = $this->_readFiles($this->_configs->source, '/(.+)\.scss/');
        array_unshift($files, "{$this->_configs->source}/styles.scss");
        $bigFile = '';
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $name = basename($file);
                $bigFile .= file_get_contents($file)."\n";
            endwhile;
        endif;
        $css = $sass->compile($bigFile);
        file_put_contents("{$this->_configs->target}dmb-styles.css", $css);
        $this->render = ['text' => 'done', 'layout'=>false];
    }

    public function setspecs() {
        $files = $this->_readFiles($this->_configs->source, '/^(?=.*\.spec).+\.js$/');

        $bigFile = '';
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $name = basename($file);
                $bigFile .= file_get_contents($file)."\n";
            endwhile;
        endif;

        file_put_contents("{$this->_configs->tests}specs.min.js", $bigFile);
    }

    public function buildDirectives() {
        $files = $this->_readFiles($this->_configs->source, '/^(?=.*\.directive)(?!.*?\.spec).+\.js$/');
        file_exists("{$this->_configs->target}dmb-components.min.js") and unlink("{$this->_configs->target}dmb-components.min.js");
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $file = $this->_cleanJS($file);
                file_put_contents("{$this->_configs->target}dmb-components.min.js", file_get_contents($file)."\n", FILE_APPEND);
            endwhile;
        endif;
    }

    public function buildFactories() {
        $files = $this->_readFiles($this->_configs->source, '/^(?=.*\.factory)(?!.*?\.spec).+\.js$/');
        file_exists("{$this->_configs->target}dmb-factories.min.js") and unlink("{$this->_configs->target}dmb-factories.min.js");
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
                file_put_contents("{$this->_configs->target}dmb-factories.min.js", file_get_contents($file)."\n", FILE_APPEND);
            endwhile;
        endif;
    }

    private function _buildConfigs() {
        $this->_configs = new stdClass();
        $confs = new stdClass();

        $this->_configs->source = INST_PATH.'src/';
        $this->_configs->target = INST_PATH.'dist/';
        $this->_configs->tests = INST_PATH.'tests/';
    }

    public function __construct() {
        $this->_buildConfigs();
    }
    public function setDumboMain() {
        //fo further actions, this section can handle obfuscation or more things
        copy("{$this->_configs->source}dumbo.js", "{$this->_configs->target}dumbo.min.js");
    }
    public function buildUI() {
        $this->sass();
        $this->setDumboMain();
        $this->buildFactories();
        $this->buildDirectives();
        $this->setspecs();
        $this->setTestPage();
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
        <div class="html-reporter">
            <div class="banner">
            </div>
            <ul class="symbol-summary"></ul>
            <div class="alert">
            </div>
            <div class="results">
            </div>
        </div>
        <div id="components">
        </div>
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
        $command = "/opt/google/chrome/chrome --headless --disable-gpu --repl --run-all-compositor-stages-before-draw --virtual-time-budget=10000 file://{$this->_configs->tests}test.html";

        $this->_logger('dumbo_ui_unit_testing', "Executing: {$command}");
        $process = proc_open($command, $descriptorspec, $pipes, $cwd, $env);
        if(is_resource($process)):
            $script = <<<DUMBO
let results = document.querySelector('.jasmine_html-reporter'), duration = results.querySelector('.jasmine-duration'), overall = results.querySelector('.jasmine-overall-result'), data = `\${duration.innerHTML} - \${overall.innerText}`; data;
DUMBO;

            fwrite($pipes[0], $script);
            fclose($pipes[0]);
            $output = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            $rvalue = proc_close($process);
            preg_match('@\{(?:.)+\}@', $output, $matches);
            $result = json_decode($matches[0])->result->value;
            preg_match('@((?:\d)+)\sfailures@', $result, $matches);
            $this->render['text'] = $result;
            $errors = !empty($errors);
            $this->_logger('dumbo_ui_unit_testing', $result);
            !!$errors and fwrite(STDERR, "{$matches[0]}\n");
        endif;
    }

    public function watchUI() {
        $this->_logger('dumbo_ui_watcher', 'Setting up files for watch...');
        $files = new ArrayObject();
        $list = [
            ...$this->_readFiles("{$this->_configs->source}", '/^(?=.*\.directive)(?!.*?\.spec).+\.js$/'),
            ...$this->_readFiles("{$this->_configs->source}", '/^(?=.*\.factory)(?!.*?\.spec).+\.js$/'),
            ...$this->_readFiles("{$this->_configs->source}", '/(.+)\.scss/'),
            ...$this->_readFiles($this->_configs->source, '/(.+)\.scss/', false)
        ];
        $this->_logger('dumbo_ui_watcher', "Watching for changes in files: \n".implode("\n", $list));

        foreach($list as $file):
            $stats = stat($file);
            $files[] = ['path'=> $file, 'mtime' => $stats['mtime']];
        endforeach;
        $this->_logger('dumbo_ui_watcher', 'Watching files...');
        while(true):
            foreach($files as  $index => $file):
                $stats = stat($file['path']);
                if($stats['size'] > 0 and $file['mtime'] !== $stats['mtime']):
                    $this->_logger('dumbo_ui_watcher', "File changed {$file['path']}");
                    $files[$index]['mtime'] = $stats['mtime'];
                    $this->_logger('dumbo_ui_watcher', 'Runing tasks...');
                    $start = microtime(true);
                    $this->buildUI();
                    $this->testUI();
                    $total = microtime(true) - $start;
                    $this->_logger('dumbo_ui_watcher', "Jobs finished, took {$total} seconds.");
                    break;
                endif;
            endforeach;
        endwhile;
    }

    public function run($argv) {
        if(empty($argv[1])):
            die('Error: Option not valid.');
        endif;

        array_shift($argv);
        $this->_command = array_shift($argv);

        if(in_array($this->_command, $this->_commands)):
            switch($this->_command):
                case 'watch':
                    $this->watchUI();
                break;
                case 'build':
                    $this->buildUI();
                break;
                case 'test':
                    $this->testUI();
                break;
            endswitch;
        else:
            die('Error: Option not valid.');
        endif;

    }
}

$builder = new Builder();
$builder->run($argv);
?>