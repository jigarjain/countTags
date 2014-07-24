$(document).ready(function() {

    $(document).foundation();

    $('.checkUrl').click(function () {
        var url = $('.url').val();

        if(url.length !==0) {
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
});