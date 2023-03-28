import { FormControl } from '@angular/forms';
import { noWhiteSpaceValidator } from './whitespace-validator.directive';

describe('WhitespaceValidatorDirective', () => {
    let mockForm: FormControl;

    beforeEach(async () => {
        mockForm = new FormControl();
    });

    it("should return null if value doesn't have whitespace", () => {
        mockForm.setValue('test');
        expect(noWhiteSpaceValidator(mockForm)).toEqual(null);
    });

    it('should return whitespace true if value has whitespace', () => {
        mockForm.setValue(' ');
        expect(noWhiteSpaceValidator(mockForm)).toEqual({ whitespace: true });
        mockForm.setValue('  ');
        expect(noWhiteSpaceValidator(mockForm)).toEqual({ whitespace: true });
        mockForm.setValue(' a ');
        expect(noWhiteSpaceValidator(mockForm)).toEqual({ whitespace: true });
        mockForm.setValue(' a');
        expect(noWhiteSpaceValidator(mockForm)).toEqual({ whitespace: true });
        mockForm.setValue('a ');
        expect(noWhiteSpaceValidator(mockForm)).toEqual({ whitespace: true });
    });
});
