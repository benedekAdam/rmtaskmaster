//example for project config
module.exports = {
    DB_ADDRESS: "", //mongodb URI
    POST_TOKEN: "", //unique token sent by Slack. Use it for request source verification
    RM_HOST: "", //url of the redmine installation you want to connect to
    RM_HOST_WITHOUT_PROTOCOL: "", //RM_HOST without http or https
    RM_DEFAULT_API_KEY: "", //default API-key to make requests with. Can be overwritten by user
    PORT: 1234, //port number the server listens on
}