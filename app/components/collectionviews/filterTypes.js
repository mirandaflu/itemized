const all = ['Text', 'Number', 'Checkbox', 'Single Select', 'Multiple Select'];

module.exports = {
	'is': {
		fieldTypes: all,
		comparison: (a, b) => {
			return a === b;
		}
	},
	'isn\'t': {
		fieldTypes: all,
		comparison: (a, b) => {
			return a !== b;
		}
	},
	'is greater than': {
		fieldTypes: ['Number'],
		comparison: (a, b) => {
			return a > b;
		}
	},
	'is less than': {
		fieldTypes: ['Number'],
		comparison: (a, b) => {
			return a < b;
		}
	},
	'contains': {
		fieldTypes: ['Text', 'Single Select', 'Multiple Select'],
		comparison: (a, b) => {
			return a.indexOf(b) !== -1;
		}
	}
};
