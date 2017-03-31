import StaticText from './statictext';
import TextInput from './textinput';
import NumberInput from './numberinput';
import CheckboxInput from './checkboxinput';
import SelectInput from './selectinput';
import DateInput from './dateinput';
import LinkInput from './linkinput';

module.exports = {
	'Static': {
		component: StaticText
	},
	'Text': {
		component: TextInput
	},
	'Number': {
		component: NumberInput
	},
	'Checkbox': {
		component: CheckboxInput
	},
	'Single Select': {
		component: SelectInput
	},
	'Multiple Select': {
		component: SelectInput
	},
	'Date': {
		component: DateInput
	},
	'Time': {
		component: DateInput
	},
	'Date and Time': {
		component: DateInput
	},
	'Email Address': {
		component: LinkInput
	},
	'URL': {
		component: LinkInput
	},
	'Attribute Reference': {
		component: StaticText
	},
	'Single Field Reference': {
		component: SelectInput
	},
	'Multiple Field Reference': {
		component: SelectInput
	}
};

/*

Possible future field types

currency/number with unit
long text
percent/progress
collaborator
linked record field
formula (calculate within collection)
lookup (get linked thing(s) attribute)
count (count linked things)
rollup (calculate based on linked things)

barcode
attachment
phone number

*/
