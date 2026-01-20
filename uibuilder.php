#!/usr/bin/php -d display_errors
<?php
$dir = dirname(realpath(__FILE__));
define('INST_PATH', exec('pwd').'/');
set_include_path(
    '/etc/dumbophp'.PATH_SEPARATOR.
    '/etc/dumbophp/bin'.PATH_SEPARATOR.
    INST_PATH.PATH_SEPARATOR.
    INST_PATH.'bin'.PATH_SEPARATOR.
    INST_PATH.'lib'.PATH_SEPARATOR.
    get_include_path().PATH_SEPARATOR.
    PEAR_EXTENSION_DIR.PATH_SEPARATOR.
    '/windows/dumbophp'.PATH_SEPARATOR.
    '/windows/dumbophp/bin'.PATH_SEPARATOR.
    '/windows/system32/dumbophp'.PATH_SEPARATOR.
    '/windows/system32/dumbophp/bin'.PATH_SEPARATOR.
    INST_PATH.'DumboPHP'
);

function Camelize($params, &$obj = null) {
    if ($obj === null):
        $string = $params;
    else:
        $string = $params[0];
    endif;

    $newName = "";
    if (preg_match("[-]", $string)):
        $names = preg_split("[-]", $string);
        $i     = 1;
        foreach ($names as $single):
            $newName .= ucfirst($single);
            $i++;
        endforeach;
    else:
        $newName .= ucfirst($string);
    endif;
    return $newName;
}

class generatorException extends Exception {}

class JSMin {
    private $_code = '';
    private $identifiers = [];
    private $counter = 0;

    public function __construct($code) {
        $this->_code = $code;
    }

    public function min() {
        if (preg_match_all('/^\b(var|let|const|function)\s+([a-zA-Z_\$][a-zA-Z0-9_\$]*)/', $this->_code, $matches)) {
            foreach($matches[2] as $identifier) {
                if (!isset($this->identifiers[$identifier])) {
                    $this->identifiers[$identifier] = $this->_nextName();
                }
            }
            $this->_code = strtr($this->_code, $this->identifiers);
        }

        foreach ($this->identifiers as $original => $obfuscated) {
            $this->_code = preg_replace('/\b' . $original . '\b/', $obfuscated, $this->_code);
        }
        return $this->_code;
    }

    private function _nextName() {
        $name = '';
        $num = $this->counter;
        do {
            $name = chr($num % 26 + 97) . $name;
            $num = floor($num / 26) - 1;
        } while ($num >= 0);
        $this->counter++;
        return $name;
    }
}

class UIGenerator {
    private $_path = '';
    private $_dumboJsDirectiveImportHeader = '';
    private $_mainConfig = null;
    private $_dmbSRC = '';

    public function __construct($path) {
        $this->_mainConfig = json_decode(file_get_contents('./dumbojs.conf.json'));
        $this->_dmbSRC = $this->_mainConfig->src;
        $this->_path = $path;
        $this->_dumboJsDirectiveImportHeader =<<<DUMBO
        import { DumboDirective } from '{$this->_dmbSRC}dumbo.min.js';
DUMBO;
    }

    public function component($name) {
        $componentsPath = "{$this->_path}components/{$name}";
        $sourceJS = "{$name}.directive.js";
        $testJS = "{$name}.directive.spec.js";
        $sass = "{$name}.scss";
        $camelizedName = Camelize($name);

        if(!mkdir($componentsPath)):
            throw new generatorException("Cannot create component directory: {$componentsPath}");
        endif;

        $directiveContent = <<<DUMBO
\n{$this->_dumboJsDirectiveImportHeader}

export class {$camelizedName} extends DumboDirective {
    static selector = '{$name}';

    constructor() {
        super();
    }

    init () {
    }
}

DUMBO;
        $specContent = <<<DUMBO
import { DumboTestApp } from '{$this->_dmbSRC}dumbo.min.js';
import { {$camelizedName} } from './{$sourceJS}';

describe('{$camelizedName} Directive', () => {
    let component = null;
    let fixture = null;

    DumboTestApp.setComponents([
        {$camelizedName}
    ]);

    beforeEach(() => {
        fixture = DumboTestApp.fixture({$camelizedName});
        component = DumboTestApp.createComponent(fixture);
    });

    afterEach( done => {
        component && component.remove();
        done();
    });

    it('Should render component', () => {
        expect(component).toBeDefined();
    });
});
DUMBO;
        $sassContent = <<<DUMBO
{$name} {
}
DUMBO;
        file_put_contents("{$componentsPath}/{$sourceJS}", $directiveContent);
        file_put_contents("{$componentsPath}/{$testJS}", $specContent);
        file_put_contents("{$componentsPath}/{$sass}", $sassContent);
    }
}
class UIBuilder {
    public $shellOutput = true;
    private $_colors = null;
    private $_command = null;
    private $_arguments = [];
    private $_params = [];
    private $_commands = [
        'build',
        'generate',
        'test'
    ];
    private $_options = [
        'watch' => ['value' => false, 'cast' => 'boolean']
    ];
    private $_specFiles = [];
    private $_mainConfig = null;

    public function __construct() {

        require_once "/etc/dumbophp/lib/DumboShellColors.php";
        $this->_colors = new DumboShellColors();
        $this->_mainConfig = json_decode(file_get_contents('./dumbojs.conf.json'));
    }

    private function _logger($source, $message) {
        if (empty($source) or empty($message) or !is_string($source) or !is_string($message)):
            return false;
        endif;
        $logdir = INST_PATH.'tmp/logs/';
        is_dir($logdir) or mkdir($logdir, 0777, true);
        $file = "{$source}.log";
        $stamp = date('d-m-Y i:s:H');

        file_exists("{$logdir}{$file}")
            and filesize("{$logdir}{$file}") >= 524288000
            and rename("{$logdir}{$file}", "{$logdir}{$stamp}_{$file}");
        $this->shellOutput and fwrite(STDOUT, "{$message}\n");
        file_put_contents("{$logdir}{$file}", "[{$stamp}] - {$message}\n", FILE_APPEND);
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

    private function _parseOptions() {
        $trueFalse = ['true' => true, 'false' => false];
        foreach($this->_arguments as $i => $arg) {
            preg_match('@\-\-([a-zA-Z0-9]+)\=([a-z0-9\-\_\/]+)[\s]*@im', $arg, $match);
            if (sizeof($match) === 3) {
                if(isset($this->_options[$match[1]])){
                    switch($this->_options[$match[1]]['cast']) {
                        case 'numeric':
                            $match[2] = (integer)$match[2];
                        break;
                        case 'boolean':
                            $match[2] = $trueFalse[strtolower($match[2])];
                        break;
                        case 'string':
                            $match[2] = trim((string)$match[2]);
                        break;
                        default:
                            throw new Exception("Value not allowed for {$match[1]}");
                        break;
                    }
                    $this->_options[$match[1]]['value'] = strlen($match[2]) > 0 ? $match[2] : null;
                }
                $this->_arguments[$i] = null;
                unset($this->_arguments[$i]);
            }
        }
    }

    private function _cleanJS($code) {
        $pattern = '/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\')\/\/.*))/';
        $code = preg_replace($pattern, '', $code);
        $search = [
            '/\>[^\S ]+/s',     // strip whitespaces after tags, except space
            '/[^\S ]+\</s',     // strip whitespaces before tags, except space
           '/(\s)+/s',         // shorten multiple whitespace sequences
            '/<!--(.|\s)*?-->/', // Remove HTML comments
            '/\s*([{};,:=()+\-*\/<>])\s*/' // remove spaces around operators
        ];
        $replace = [
            '>',
            '<',
            '\\1',
            '',
            '$1'
        ];
        return preg_replace($search, $replace, $code);
    }

    private function _cleanHTML($code) {
        $search = [
            '/\>[^\S ]+/s',     // strip whitespaces after tags, except space
            '/[^\S ]+\</s',     // strip whitespaces before tags, except space
            '/<!--(.|\s)*?-->/' // Remove HTML comments
        ];
        $replace = [
            '>',
            '<',
            ''
        ];
        return preg_replace($search, $replace, $code);
    }

    private function _setImport(string $content): string {

        return str_replace('../dumbo.js', './dumbo.min.js', $content);
    }

    public function sassAction() {
        $sass = new Sass();
        $sass->setStyle(Sass::STYLE_COMPRESSED);
        $files = $this->_readFiles(INST_PATH.'src/', '/(.+)\.scss/');
        array_unshift($files, INST_PATH.'src/styles.scss');
        $bigFile = '';
        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $bigFile .= file_get_contents($file)."\n";
            endwhile;
        endif;
        $css = $sass->compile($bigFile);
        file_put_contents(INST_PATH.'dist/styles.css', $css);
    }

    public function setspecsAction() {
        $files = $this->_readFiles(INST_PATH.$this->_mainConfig->src, '/^(?=.*\.spec).+\.js$/');
        $this->_specFiles = [];

        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $this->_specFiles[] = str_replace(INST_PATH, '/', $file);
            endwhile;
        endif;
    }

    public function setComponents() {
        $filesjs = $this->_readFiles(INST_PATH."src/", '/(.+)\.js/');
        $fileContent = '';

        if(sizeof($filesjs) > 0):
            while (null !== ($file = array_shift($filesjs))):
                $name = basename($file);
                $fileContent = file_get_contents($file);
                $fileContent = $this->_cleanJS($fileContent);
                $fileContent = $this->_setImport($fileContent);

                file_put_contents(INST_PATH."dist/{$name}", $fileContent);
            endwhile;
        endif;
    }

    public function setTemplates() {
        $files = $this->_readFiles(INST_PATH."src/", '/(.+)\.html$/');
        $fileContent = '';

        if(sizeof($files) > 0):
            while (null !== ($file = array_shift($files))):
                $name = basename($file);
                $fileContent = file_get_contents($file);
                $fileContent = $this->_cleanHTML($fileContent);

                file_put_contents(INST_PATH."dist/{$name}", $fileContent);
            endwhile;
        endif;
    }

    public function setIndexes() {
        $directives = $this->_readFiles(INST_PATH."dist/", '/^(?=.*\.directive).+\.js$/');
        $factories = $this->_readFiles(INST_PATH."dist/", '/^(?=.*\.factory).+\.js$/');

        $includes = [];
        if(sizeof($directives) > 0):
            while (null !== ($file = array_shift($directives))):
                $includes[] = "export * from './".basename($file)."';";
            endwhile;
        endif;

        file_put_contents(INST_PATH.'dist/directives.js', implode("\n",$includes));

        $includes = [];
        if(sizeof($factories) > 0):
            while (null !== ($file = array_shift($factories))):
                $includes[] = "export * from './".basename($file)."';";
            endwhile;
        endif;

        file_put_contents(INST_PATH.'dist/factories.js', implode("\n",$includes));
    }

    public function minifyDumbo() {
        $code = file_get_contents(INST_PATH.$this->_mainConfig->src.'dumbo.js');
        $code = $this->_cleanJS($code);
        $jsmin = new JSMin($code);
        $minified = $jsmin->min();
        file_put_contents(INST_PATH.'dist/dumbo.min.js', $minified);
    }

    public function buildUIAction() {
        $this->_logger('dumbo_ui_builder', 'Building files...');
        $start = microtime(true);
        // $this->sassAction();
        // $this->setComponents();
        // $this->setTemplates();
        // $this->setIndexes();
        $this->minifyDumbo();
        // $this->setTestPageAction();

        // $this->_options['watch']['value'] && $this->watchUIAction();
        $total = microtime(true) - $start;
        $this->_logger('dumbo_ui_builder', "Jobs finished, took {$total} seconds.");
    }

    public function setTestPageAction() {
        $this->_logger('dumbo_ui_builder', 'Building test files...');


        $this->setspecsAction();
        $specs = '';

        while(null !== ($file = array_shift($this->_specFiles))):
            $specs =<<<DUMBO
    {$specs}
    <script src="{$file}" type="module"></script>
DUMBO;
        endwhile;
        $page = <<<DUMBO
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Dumbo UI tests</title>
    <link rel="preconnect" href="./">

    <link rel="stylesheet" type="text/css" href="jasmine/jasmine.css">
    <link rel="stylesheet" type="text/css" href="dist/styles.css">

    <link rel="preload" as="style" type="text/css" href="dist/styles.css">

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

    <script src="jasmine/jasmine.js" type="text/javascript"></script>
    <script src="jasmine/jasmine-html.js" type="text/javascript"></script>
    <script src="jasmine/jasmine-boot.js" type="text/javascript"></script>
    {$specs}
</body>
</html>
DUMBO;

        file_put_contents(INST_PATH.'tests/test.html',$page);
    }

    public function testUIAction() {
        $this->buildUIAction();
        $descriptorsserver = [
            ['pipe', 'r'],
            ['pipe', 'w'],
            ['file', '/tmp/error-output.txt', 'a'],
        ];
        $cwd = './app/webroot/';
        $env = [];

        $processServer = proc_open('php -S localhost:3456', $descriptorsserver, $pipeserver, $cwd, $env);

        $descriptorspec = [
            ['pipe', 'r'],
            ['pipe', 'w'],
            ['file', '/tmp/error-output.txt', 'a'],
        ];
        $pathToComponents = 'file://' .INST_PATH. 'app/webroot/';
        $command =<<<DUMBO
        /home/rantes/chromium/chrome \\
        --headless \\
        --disable-gpu \\
        --repl \\
        --run-all-compositor-stages-before-draw \\
        --virtual-time-budget=10000 \\
        http://localhost:3456/test.html
DUMBO;

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
            if(is_resource($processServer)):
                fclose($pipeserver[0]);
                fclose($pipeserver[1]);
                proc_terminate($processServer);
            endif;

            if ($rvalue === 0):
                preg_match('@(exceptionDetails)@i', $output, $matches);
                if (empty($matches)):
                    $output = str_replace('>>>', '', $output);
                    $output = trim($output);
                    $result = json_decode($output)->result;
                    preg_match('@((?:\d)+)\sfailures@', $result->value, $matches);
                    $errors = !empty($matches);
                    $this->_logger('dumbo_ui_unit_testing', $result->value);
                    (bool)$errors and fwrite(STDERR, "{$matches[0]}\n");
                else:
                    $this->showError("Exception happened: {$output}");
                endif;
            else:
                $this->showError('Oops! something happened!');
            endif;
        endif;
    }

    private function help() {
        $text = <<<DUMBO
▓█████▄  █    ██  ███▄ ▄███▓ ▄▄▄▄    ▒█████
▒██▀ ██▌ ██  ▓██▒▓██▒▀█▀ ██▒▓█████▄ ▒██▒  ██▒
░██   █▌▓██  ▒██░▓██    ▓██░▒██▒ ▄██▒██░  ██▒
░▓█▄   ▌▓▓█  ░██░▒██    ▒██ ▒██░█▀  ▒██   ██░
░▒████▓ ▒▒█████▓ ▒██▒   ░██▒░▓█  ▀█▓░ ████▓▒░
 ▒▒▓  ▒ ░▒▓▒ ▒ ▒ ░ ▒░   ░  ░░▒▓███▀▒░ ▒░▒░▒░
 ░ ▒  ▒ ░░▒░ ░ ░ ░  ░      ░▒░▒   ░   ░ ▒ ▒░
 ░ ░  ░  ░░░ ░ ░ ░      ░    ░    ░ ░ ░ ░ ▒
   ░       ░            ░    ░          ░ ░
 ░                                ░

DumboPHP 2.0 by Rantes
DumboUI shell.
Ussage:

    dumbo <command> <option> <params>

Commands:

    build
        Builds the UI components

    Options:
        --watch=[true|false]    Set a daemon to watch files (used in tests)
    
    generate [component] <name>
        Generates scripts for component.


DUMBO;
        fwrite(STDOUT, $text . "\n");
    }

    public function watchUIAction() {
        $this->_logger('dumbo_ui_watcher', 'Setting up files for watch...');
        $files = new ArrayObject();
        $list = [
            ...$this->_readFiles(INST_PATH.$this->_mainConfig->src, '/(.+)\.scss/', false),
            ...$this->_readFiles(INST_PATH.$this->_mainConfig->src, '/^(.+)\.js$/'),
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
                    $this->sassAction();
                    $this->setTestPageAction();
                    $total = microtime(true) - $start;
                    $this->_logger('dumbo_ui_watcher', "Jobs finished, took {$total} seconds.");
                    break;
                endif;
            endforeach;
        endwhile;
    }

    public function showError($errorMessage) {
        fwrite(STDOUT, $this->_colors->getColoredString($errorMessage, "white", "red") . "\n");
    }

    public function showMessage($errorMessage) {
        fwrite(STDOUT, $this->_colors->getColoredString($errorMessage, "white", "green") . "\n");
    }

    public function showNotice($errorMessage) {
        fwrite(STDOUT, $this->_colors->getColoredString($errorMessage, "blue", "yellow") . "\n");
    }

    private function generateScripts() {
        if(empty($this->_arguments[0]) && sizeof($this->_arguments) < 2) {
            $this->help();
            die('Error: Missing params.');
        }

        for ($i=1; $i < sizeof($this->_arguments); $i++) {
            $this->_params[] = $this->_arguments[$i];
        }

        $generator = new UIGenerator(INST_PATH.'ui-components/');

        switch ($this->_arguments[0]) {
            case 'component':
                $this->showNotice('Creating scaffold for "'.$this->_arguments[1].'".');
                $generator->component($this->_arguments[1]);
            break;

            default:
                $this->help();
                die('Option no valid for generate.');
            break;
        }
    }

    public function run($argv) {
        if(empty($argv[1])):
            $this->help();
            die('Error: Option not valid.');
        endif;

        array_shift($argv);
        $this->_command = array_shift($argv);
        $this->_arguments = $argv;
        $this->_parseOptions();

        if(in_array($this->_command, $this->_commands)):
            switch($this->_command):
                case 'generate':
                    $this->generateScripts();
                break;
                case 'test':
                    $this->testUIAction();
                break;
                case 'build':
                default:
                    $this->buildUIAction();
                break;
            endswitch;
        else:
            $this->help();
            die('Error: Option not valid.');
        endif;

    }
}
$builder = new UIBuilder();
$builder->run($argv);