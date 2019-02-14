export default function() {
  const controller = new AbortController()

  window.editor = SwaggerEditorBundle({
    dom_id: '#swagger-editor',
    url: 'resources/access_eligibility_api.yaml'
  });

  $('.SplitPane').css('position', 'relative');
  $('.Pane1').css('display', 'none');
  $('.Pane2').css('width', '100%');

  /* Generate sample curl command to execute */
  $('body').on('click', '.try-out__btn', function(event){
    generateCurl(this)
  })

  $('body').on('keyup', '.body-param__text', function(event){
    generateCurl(this);
  })

  function generateCurl(obj){
    var domain = $('body').find('.servers :selected').text();
    var ep_id = $(obj).parents('.opblock-post:first').attr('id');
    var ep = ep_id.substr(ep_id.lastIndexOf("_") + 1);
    var par_node = $(obj).parents('.opblock-body:first');
    var params = $(obj).val();

    if (!params) {
      console.log('no params')
      params = par_node.find('.body-param__example').text();
    }

    params = params.replace(/\s/g,'').replace(/"/g,'\\"')

    par_node.find('.curl').remove();
    par_node.find('.execute-wrapper').append('<p class="curl">Use the following command to make a request to the <strong>/' + ep + '</strong> endpoint based on the data set above:</p>');
    
    if (ep_id.includes('Authentication')) {
      par_node.find('.execute-wrapper').append('<textarea readonly="" class="curl" style="white-space: normal;">curl -X POST "' + domain + '/' + ep + '" -H  "accept: application/json" -H  "Content-Type: application/json" -d "' + params + '"</textarea>')
    } else if (ep_id.includes('eligibilityPrograms')){
      var key_val= par_node.find('[placeholder^=x-api-key]').val();
      var auth_val= par_node.find('[placeholder^=Authorization]').val();
      par_node.find('.execute-wrapper').append('<textarea readonly="" class="curl" style="white-space: normal;">curl -X POST "https://sandbox.eligibilityapi.cityofnewyork.us/' + ep + '" -H "accept: application/json" -H "x-api-key: ' + key_val + '" -H "Authorization: ' + auth_val + '" -H "Content-Type: application/json" -d "'+ params +'"</textarea>');
    }
  }
}