import { Integrations } from '../../../db/models';
var AccessToken = require('twilio').jwt.AccessToken;

export default {
  getLiveRoom(root, args) {
    var identity = `chatUser - ${Math.random() * 1000000}`;
    var VideoGrant = AccessToken.VideoGrant;

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created.
    var token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
    );

    // Assign the generated identity to the token.
    token.identity = identity;

    // Grant the access token Twilio Video capabilities.
    var grant = new VideoGrant();
    token.addGrant(grant);

    // Serialize the token to a JWT string and include it in a JSON response.

    return Integrations.getIntegration(args.brandCode, 'live_room').then(integration => ({
      ...integration,
      identity,
      token: token.toJwt(),
    }));
  },
};
