<?php
/**
 * Plugin Name: Enable CORS
 * Description: A simple plugin to enable CORS for all origins and methods.
 * Version: 1.0
 * Author: Michal
 */

function enable_cors() {
  header('Access-Control-Allow-Origin: *'); // You can replace '*' with a specific domain if needed
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: *');
  header('Access-Control-Allow-Credentials: true');
}

add_action('init', 'enable_cors');