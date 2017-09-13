import { Integrations } from '../../../db/models';

export default {
  getLiveRoom(root, args) {
    return Integrations.getIntegration(args.brandCode, 'live_room');
  },
};
