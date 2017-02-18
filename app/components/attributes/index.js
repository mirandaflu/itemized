import TextInput from './textinput.jsx';
import NumberInput from './numberinput.jsx';
import CheckboxInput from './checkboxinput.jsx';
import SelectInput from './selectinput.jsx';

module.exports = {
	"Text": {
		component: TextInput
	},
	"Number": {
		component: NumberInput
	},
	"Checkbox": {
		component: CheckboxInput
	},
	"Single Select": {
		component: SelectInput
	},
	"Multiple Select": {
		component: SelectInput
	}
};

/*

Possible future field types

single line text
number (specify number of decimal places)
currency/number with unit
checkbox
single select
multiple select
url
email address
long text
date
date + time
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
