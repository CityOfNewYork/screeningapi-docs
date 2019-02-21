const util = require('util')

export default function() {
  const controller = new AbortController()

  window.editor = SwaggerEditorBundle({
    dom_id: '#swagger-editor',
    url: 'resources/access_eligibility_api.yaml'
  });

  $('.SplitPane').css('position', 'relative');
  $('.Pane1').css('display', 'none');
  $('.Pane2').css('width', '100%');

  // generate curl command to try it out
  $('body').on('click', '.try-out__btn', function(event){
    generateCurl(this)
  })

  $('body').on('keyup', '[placeholder^=x-api-key]', function(event){
    generateCurl(this);
  })

  $('body').on('keyup', '[placeholder^=Authorization]', function(event){
    generateCurl(this);
  })

  $('body').on('change', '[type^=file]', function(event){
    generateCurl(this);
  })

  function generateCurl(obj) {
    const domain = $('body').find('.servers :selected').text();
    const ep_id = $(obj).parents('.opblock-post:first').attr('id');
    const ep = util.format("/%s", ep_id.substr(ep_id.indexOf("_") + 1).replace("_", "/"));
    const par_node = $(obj).parents('.opblock-body:first');
    const params = par_node.find('.body-param__example').text().replace(/\s/g,'').replace(/"/g,'\\"');

    par_node.find('.curl').remove();
    par_node.find('.execute-wrapper').append(util.format('<p class="curl">Use the following command to make a request to the <strong>%s</strong> endpoint based on the data set above:</p>', ep));

    const keyVal = par_node.find('[placeholder^=x-api-key]').val();
    const authVal = par_node.find('[placeholder^=Authorization]').val();
    if (ep_id.includes('Authentication')) {
      const authenticationCurl = util.format('curl -X POST "%s%s" \
        -H  "accept: application/json" \
        -H  "Content-Type: application/json" \
        -d "%s"', domain, ep, params);
      par_node.find('.execute-wrapper').append(util.format('<textarea readonly="" class="curl" style="white-space: normal;">%s</textarea>', authenticationCurl));
    } else if (ep_id.includes('eligibilityPrograms')){
      const eligibilityProgramsCurl = util.format('curl -X POST "%s%s" \
        -H "accept: application/json" \
        -H "Content-Type: application/json" \
        -H "x-api-key: %s" \
        -H "Authorization: %s"\
        -d "%s"', domain, ep, keyVal, authVal, params);
      par_node.find('.execute-wrapper').append(util.format('<textarea readonly="" class="curl" style="white-space: normal;">%s</textarea>', eligibilityProgramsCurl));
    } else if (ep_id.includes('bulkSubmission')) {
      const inputPath = par_node.find('[type^=file]').val();
      const bulkSubmissionCurl = util.format('curl -X POST "%s%s" \
        -H "accept: multipart/form-data" \
        -H "Content-Type: multipart/form-data" \
        -H "x-api-key: %s" \
        -H "Authorization: %s"\
        -F "=@%s;type=text/csv"', domain, ep, keyVal, authVal, inputPath);
      par_node.find('.execute-wrapper').append(util.format('<textarea readonly="" class="curl" style="white-space: normal;">%s</textarea>', bulkSubmissionCurl));
    }
  }
}
