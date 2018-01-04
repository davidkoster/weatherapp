<?php

$feed = file_get_contents('ftp://ftp.bom.gov.au/anon/gen/fwo/IDQ11295.xml');
$xml = simplexml_load_string($feed);

print_r($xml);