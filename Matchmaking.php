<?php

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $post = json_decode(file_get_contents('php://input'));
        $code = $post->code;
        $type = $post->type;
        $filename = "connections/".$code."/".$type.".txt";
        $folder = "connections/".$code;
        if (isset($post->data)) {
            if ($type == "offer" && is_dir($folder)) {
                $files = scandir($folder);
                foreach($files as $file) {
                    if ($file != "." && $file != "..") {
                        unlink($folder."/".$file);
                    }
                }
            }
            $data = $post->data;
            echo $data;
            @mkdir("connections/");
            @mkdir($folder);
            $file = @fopen($filename, "w");
            fwrite($file, $data);
            fclose($file);
        } else {
            $file = @fopen($filename, "r") or die("");
            echo fread($file, filesize($filename));
            fclose($file);
        }
    }
?>