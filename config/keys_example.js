//example for project config
module.exports = {
    DB_ADDRESS: "", //mongodb URI
    POST_TOKEN: "", //unique token sent by Slack. Use it for request source verification
    RM_HOST: "", //url of the redmine installation you want to connect to
    RM_DEFAULT_API_KEY: "", //default API-key to make requests with. Can be overwritten by user
    PORT: 1234, //port number the server listens on
    HELP_KEYWORD: ['string1', 'string 2', 'string3.1'], //if this is the posted text, display the help message. Text will be converted to lowercase
}