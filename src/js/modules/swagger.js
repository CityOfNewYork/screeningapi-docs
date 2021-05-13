// import * as SwaggerUI from 'swagger-ui';

export default function(cdn) {
  // const controller = new AbortController()\
  // const SwaggerUI = require('swagger-ui');

  SwaggerUIBundle({
    dom_id: '#swagger-editor',
    url: cdn + 'endpoints.yml'
  });

  // window.editor = SwaggerEditorBundle({
  //   dom_id: '#swagger-editor',
  //   url: cdn + 'endpoints.yml'
  // });

  $('.SplitPane').css('position', 'relative');
  $('.Pane1').css('display', 'none');
  $('.Pane2').css('width', '100%');

  // generate curl command to try it out
  $('body').on('click', '.try-out__btn', function(event){
    generateCurl(this)
  })

  $('body').on('keyup', '[placeholder^=interestedPrograms]', function(event){
    generateCurl(this);
  })

  $('body').on('keyup', '[placeholder^=Authorization]', function(event){
    generateCurl(this);
  })

  $('body').on('keyup', '[class^=body-param__text]', function(event){
    generateCurl(this);
  })

  $('body').on('change', '[type^=file]', function(event){
    generateCurl(this);
  })

  // $('#swagger-editor').fadeIn(2500)

  function generateCurl(obj) {
    const domain = $('body').find('.servers :selected').text();
    const ep_id = $(obj).parents('.opblock-post:first').attr('id');
    const ep = util.format("/%s", ep_id.substr(ep_id.indexOf("_") + 1).replace("_", "/"));
    const par_node = $(obj).parents('.opblock-body:first');
    const exampleBody = par_node.find('.body-param__example');
    const textBody = exampleBody.length > 0 ? exampleBody.text() : par_node.find('.body-param__text').text()
    const params = textBody.replace(/\s/g,'');

    par_node.find('.curl').remove();
    par_node.find('.execute-wrapper').append(`<p class="curl">Use the following command to make a request to the <strong>${ep}</strong> endpoint based on the data set above:</p>`);

    const authVal = par_node.find('[placeholder^=Authorization]').val();
    const interestedProgramsVal = par_node.find('[placeholder^=interestedPrograms]').val();
    const query = interestedProgramsVal ? `?interestedPrograms=${interestedProgramsVal}` : ""
    if (ep_id.includes('Authentication')) {
      const authenticationCurl = `curl -X POST "${domain}${ep}" \
        -H  "accept: application/json" \
        -H  "Content-Type: application/json" \
        -d \'${params}\'`;
      par_node.find('.execute-wrapper').append(`<textarea readonly="" class="curl" style="white-space: normal;">${authenticationCurl}</textarea>`);
    } else if (ep_id.includes('eligibilityPrograms')){
      const eligibilityProgramsCurl = `curl -X POST "${domain}${ep}${query}" \
        -H "accept: application/json" \
        -H "Content-Type: application/json" \
        -H "Authorization: ${authVal}"\
        -d \'${params}\'`;
      par_node.find('.execute-wrapper').append(`<textarea readonly="" class="curl" style="white-space: normal;">${eligibilityProgramsCurl}</textarea>`);
    } else if (ep_id.includes('bulkSubmission')) {
      const inputPath = par_node.find('[type^=file]').val();
      const bulkSubmissionCurl = `curl -X POST "${domain}${ep}${query}" \
        -H "accept: multipart/form-data" \
        -H "Content-Type: multipart/form-data" \
        -H "Authorization: ${authVal}"\
        -F "=@${inputPath};type=text/csv"`;
      par_node.find('.execute-wrapper').append(`<textarea readonly="" class="curl" style="white-space: normal;">${bulkSubmissionCurl}</textarea>`);
    }
  }
}
