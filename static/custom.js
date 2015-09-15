function(){

var $items = $('input:checked');

$('#generate').click(function(){
    window.location.replace(encodeURI(
        '/create?plots='+
        JSON.stringify(
            $items.map(function(){return $(this).data('url'); }).get()
        )
    ));
});

}();
