import { FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class ShopValidators {

    //whitespace validator
    static notOnlyWhitespace(control: FormControl): ValidationErrors{
        //controlliamo che la scringa non sia formata da soli spazi bianchi
        if((control.value!=null) && (control.value.trim().length === 0)){
            return {'notOnlyWhitespace': true};
        }else{
            return  null;//se ritorno null é tutto apposto
        }
    }

}
