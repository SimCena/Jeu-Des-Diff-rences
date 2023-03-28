import { FormControl, ValidationErrors } from '@angular/forms';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function noWhiteSpaceValidator(control: FormControl): ValidationErrors | null {
    const hasWhiteSpaces = (value: string): boolean => {
        return value.split(' ').length > 1;
    };

    return hasWhiteSpaces((control.value as string) || '') ? { whitespace: true } : null;
}
