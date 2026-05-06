@props(['title' => '', 'description' => '', 'url' => ''])

<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" class="js">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />

        <title>{{ $title }}</title>

        <meta
            name="description"
            content="{{ $description }}"
        />

        <link href="{{ $url }}" rel="canonical" />

        <meta name="twitter:card" content="summary" />
        <meta property="fb:app_id" content="187131075036737" />
        <meta
            property="og:site_name"
            content="St. Emile Roman Catholic Church"
        />
        <meta property="og:url" content="{{ $url }}" />
        <meta property="og:title" content="St. Emile Roman Catholic Church" />

        <meta
            property="og:description"
            content="{{ $description }}"
        />

        <!-- CSS Files -->
        <link rel="stylesheet" href="{{ asset('css/jquery-ui.min.css') }}" />
        <link rel="stylesheet" href="{{ asset('css/jquery-ui.structure.min.css') }}" />
        <link rel="stylesheet" href="{{ asset('css/jquery-ui.theme.min.css') }}" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        <!-- JS Files -->
        <script src="{{ asset('js/jquery.min.js') }}"></script>
        <script>
            var $ec = jQuery.noConflict();
            var $ = $ec; // Reassigns the $ to jQuery, but can be overwritten if another version of jQuery is loaded
        </script>
        <script src="{{ asset('js/jquery-ui-1.13.2.custom.min.js') }}"></script>
        <script src="{{ asset('js/hammer.min.js') }}"></script>
        <script src="{{ asset('js/jquery.focuspoint.js') }}"></script>
        <script src="{{ asset('js/jquery.textfill.min.js') }}"></script>
        <script src="{{ asset('js/jquery.ui.touch-punch.min.js') }}"></script>
        <script src="{{ asset('js/modernizer.custom.2.7.1.js') }}"></script>
        <script src="{{ asset('js/quick_modal.js') }}"></script>

        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <style>
            #background:after {
                height: 191px;
            }
        </style>
    </head>
    <body
        baseurl="/"
        class="ecatholic pageTypeHome"
        style="--currentYear: 2026"
    >
        <x-nav />
        {{ $slot }}
    <x-footer />
    </body>
</html>