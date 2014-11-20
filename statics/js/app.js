$(document).ready(function() {

    $(document).foundation();
    var BASE_URL = $('body').data('baseurl');

    $('.url-form').on('submit', function(e) {
        e.preventDefault();
        var url = $('.url').val();
        if(url.length !== 0) {
            $('.url-form').find('button').html('<i class="fa fa-spin fa-spinner"></i> Fetching');
            $.ajax({
                url: BASE_URL + '/',
                method: 'POST',
                dataType: 'json',
                data: {url: url}
            }).done(function(resp) {
                if(resp.code === 1) {
                    location.href= BASE_URL + '/' + resp.url;
                } else {
                    $('.error-msg').show();
                }
            });
        }else{
            $('small.error').show();
        }
    });

    if ($.fn.footable && $('.footable').length !== 0) {
         $('.footable').footable();
    }

    $('[data-color]').each(function () {
        $(this).css('color', $(this).data('color'));
    });

    $('[data-font-family]').each(function () {
        $(this).css('font-family', $(this).data('fontFamily'));
    });

});