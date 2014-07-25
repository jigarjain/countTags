$(document).ready(function() {

    $(document).foundation();

    $('.url-form').on('valid.fndtn.abide', function() {

        var url = $('.url').val();

        if(url.length !== 0) {
            $('.url-form').find('button').html('<i class="fa fa-spin fa-spinner"></i> Fetching')
            $.ajax({
                url: "/",
                method: 'POST',
                dataType: 'json',
                data: {url: url}
            }).done(function(resp) {
                if(resp.code === 1) {
                    location.href="/" + resp.url;
                } else {
                    alert('Error');
                }
            });
        }else{
            alert('type URL');
        }
    });

    if ($.fn.footable && $('.footable').length !== 0) {
         $('.footable').footable();
    }

});