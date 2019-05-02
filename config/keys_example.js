//example for project config
module.exports = {
    DB_ADDRESS: "", //mongodb URI
    POST_TOKEN: "", //unique token sent by Slack. Use it for request source verification
    RM_HOST: "", //url of the redmine installation you want to connect to
    RM_DEFAULT_API_KEY: "", //default API-key to make requests with. Can be overwritten by user
}