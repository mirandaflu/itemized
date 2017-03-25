import CollectionTable from './collectiontable.jsx';
import CollectionBoard from './collectionboard.jsx';
import CollectionCalendar from './collectioncalendar.jsx';

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
