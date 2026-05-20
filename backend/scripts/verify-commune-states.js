import 'dotenv/config';
import { getCommuneMapData } from '../src/services/map.js';

const { communes } = await getCommuneMapData({ moment: 'live' });
const tally = { ONLINE: 0, OFFLINE: 0, UNSTABLE: 0 };
for (const c of communes) {
  tally[c.state] = (tally[c.state] ?? 0) + 1;
  console.log(`${c.name.padEnd(10)} ${c.state.padEnd(8)} counts`, c.counts);
}
console.log('\nPastilles communales:', tally);
