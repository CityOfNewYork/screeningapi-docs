export default function() {

  window.editor = SwaggerEditorBundle({
    dom_id: '#swagger-editor',
    url: 'resources/access_eligibility_api.yaml'
  });

  $('.SplitPane').css('position', 'relative');
  $('.Pane1').css('display', 'none');
  $('.Pane2').css('width', '100%');

  // hide elements in response
    $('body').on('click', '.execute', function(event){
      var par_node = $(this).parent().next();

      setTimeout(
        function() {
          var res = par_node.find('.responses-inner').children().first().children().first()

          res.children().each(function(i){
            if ( i != 0 ){
              $(this).hide();
            }
          })
        },
      100);
    })
}