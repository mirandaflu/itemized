import CollectionTable from './collectiontable';
import CollectionBoard from './collectionboard';
import CollectionCalendar from './collectioncalendar';

module.exports = {
	'Table': {
		component: CollectionTable,
		controls: {
			hide: true,
			sort: true,
			filter: true,
			group: true
		}
	},
	'Board': {
		component: CollectionBoard,
		controls: {
			filter: true,
			listby: true,
			cardname: true,
			swimlane: true
		}
	},
	'Calendar': {
		component: CollectionCalendar,
		controls: {
			filter: true,
			cardname: true,
			dateby: true
		}
	}
};
