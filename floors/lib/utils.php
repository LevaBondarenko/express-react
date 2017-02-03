<?php

namespace Roots\Sage\Utils;

/**
 * Tell WordPress to use searchform.php from the templates/ directory
 */
function get_search_form() {
  $form = '';
  locate_template('/templates/searchform.php', true, false);
  return $form;
}
add_filter('get_search_form', __NAMESPACE__ . '\\get_search_form');

/**
 * Make a URL relative
 */
function root_relative_url($input) {
  preg_match('|https?://([^/]+)(/.*)|i', $input, $matches);
  if (!isset($matches[1]) || !isset($matches[2])) {
    return $input;
  } elseif (($matches[1] === $_SERVER['HTTP_HOST']) || $matches[1] === $_SERVER['HTTP_HOST'] . ':' . $_SERVER['SERVER_PORT']) {
    return wp_make_link_relative($input);
  } else {
    return $input;
  }
}

/**
 * Compare URL against relative URL
 */
function url_compare($url, $rel, $strict = true) {
  $url = root_relative_url(trailingslashit($url));
  $rel = root_relative_url(trailingslashit($rel));

  if ($strict) {
    if ((strcasecmp($url, $rel) === 0) || $url == $rel) {
      return true;
    } else {
      return false;
    }
  } else if ($rel == '/') {
    return $url == $rel;
  } else {
    return strpos($url, $rel) !== false;
  }
}

/**
 * Check if element is empty
 */
function is_element_empty($element) {
  $element = trim($element);
  return !empty($element);
}

function declOfNum($number, $titles) {
 $cases = array (2, 0, 1, 1, 1, 2);
 return $number." ".$titles[ ($number%100 > 4 && $number %100 < 20) ? 2 : $cases[min($number%10, 5)] ];
}

function _where($list, $props) {
    $result = array_filter(
        $list,
        function ($e) use ($props) {
            $count = 0;
            foreach ($props as $key => $value) {
                if ($value == $e[$key]) {
                    $count += 1;
                }
            }
            return $count == count($props);
        }
    );
    return $result;
}

function _findWhere($list, $props) {
    $result = _where($list, $props);
    return empty($result) ? '' : array_values($result)[0];
}

function get_class_property($className, $property) {
  if(!class_exists($className)) return null;
  if(!property_exists($className, $property)) return null;

  $vars = get_class_vars($className);
  return $vars[$property];
}
