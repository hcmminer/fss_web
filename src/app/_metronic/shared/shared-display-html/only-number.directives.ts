import { E } from "@angular/cdk/keycodes";
import { formatNumber } from "@angular/common";
import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({ selector: "[NumbersOnly]" })
export class NumbersOnlyDirective {
  @Input() allowDecimals: boolean = true;
  @Input() allowSign: boolean = false;
  @Input() allowThousandSeparator: boolean = false;
  @Input() decimalSeparator: string = ".";

  previousValue: string = "";

  // --------------------------------------
  //  Regular expressions
  integerUnsigned = /^[0-9]*$/;
  integerSigned = /^-?[0-9]+$/;
  decimalUnsigned = /^[0-9]+(.[0-9]+)?$/;
  decimalSigned = /^-?[0-9]+(.[0-9]+)?$/;
  thousandSeparatorIntegerUnsigned = /^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$/;
  thousandSeparatorIntegerSigned = /^-?(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$/;
  thousandSeparatorDecimalUnsigned = /^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*(\.\d+)?$/;
  thousandSeparatorDecimalSigned = /^-?(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*(\.\d+)?$/;

  /**
   * Class constructor
   * @param hostElement
   */
  constructor(private hostElement: ElementRef) {}

  /**
   * Event handler for host's change event
   * @param e
   */
  @HostListener("change", ["$event"]) onChange(e) {
    this.validateValue(this.hostElement.nativeElement.value, e, 'change');
  }

  /**
   * Event handler for host's paste event
   * @param e
   */
  @HostListener("paste", ["$event"]) onPaste(e) {
    // get and validate data from clipboard
    let value = e.clipboardData.getData("text/plain");
    this.validateValue(value, e, 'paste');
  }

  /**
   * Event handler for host's keydown event
   * @param event
   */
  @HostListener("keydown", ["$event"]) onKeyDown(e: KeyboardEvent) {
    let cursorPosition: number = e.target["selectionStart"];
    let originalValue: string = e.target["value"];
    let key: string = this.getName(e);
    let controlOrCommand = e.ctrlKey === true || e.metaKey === true;
    let signExists = originalValue.includes("-");
    let separatorExists = originalValue.includes(this.decimalSeparator);

    // allowed keys apart from numeric characters
    let allowedKeys = ["ArrowLeft", "ArrowRight", "Escape", "Tab"];

    // when decimals are allowed, add
    // decimal separator to allowed codes when
    // its position is not close to the the sign (-. and .-)
    let separatorIsCloseToSign = signExists && cursorPosition <= 1;
    if (this.allowDecimals && !separatorIsCloseToSign && !separatorExists) {
      if (this.decimalSeparator == ".") allowedKeys.push(".");
      else allowedKeys.push(",");
    }

    // when minus sign is allowed, add its
    // key to allowed key only when the
    // cursor is in the first position, and
    // first character is different from
    // decimal separator
    let firstCharacterIsSeparator =
      originalValue.charAt(0) != this.decimalSeparator;
    if (
      this.allowSign &&
      !signExists &&
      firstCharacterIsSeparator &&
      cursorPosition == 0
    ) {
      allowedKeys.push("-");
    }

    // allow some non-numeric characters
    if (
      allowedKeys.indexOf(key) != -1 ||
      // Allow: Ctrl+A and Command+A
      (key == "a" && controlOrCommand) ||
      // Allow: Ctrl+C and Command+C
      (key == "c" && controlOrCommand) ||
      // Allow: Ctrl+V and Command+V
      (key == "v" && controlOrCommand) ||
      // Allow: Ctrl+X and Command+X
      (key == "x" && controlOrCommand)
    ) {
      // let it happen, don't do anything
      return;
    }

    // save value before keydown event
    this.previousValue = originalValue;

    // allow number characters only
    let isNumber = new RegExp(this.integerUnsigned).test(key);
    if (isNumber) {
      if (originalValue.length == 15) {
        e.preventDefault();
      }
      e.target["value"] = e.target["value"].replace(/,/g, '');
      return;
    } else if (key == "Backspace" || key == "Delete") {
      e.target["value"] = e.target["value"].replace(/,/g, '');
      return;
    }
    else e.preventDefault();
  }

  /**
   * Author: KhanhND
   * Event handler for host's keyup event (use for format number with thousand separator)
   * @param event
   */
  @HostListener("keyup", ["$event"]) onKeyUp(e: KeyboardEvent) {
    if (this.allowThousandSeparator) {
      let nextValue: string = e.target["value"].replace(/,/g, '');
      let formattedValue = nextValue != '' ? formatNumber(+nextValue, 'en-US', '1.0') : '';
      e.target["value"] = formattedValue;
      return;
    }
  }

  /**
   * Author (edit): KhanhND
   * Test whether value is a valid number or not
   * @param value
   */
  validateValue(value: string, e, eventType: string): void {
    // choose the appropiate regular expression
    let regex;
    let regexThousandSeparator;
    if (!this.allowDecimals && !this.allowSign) {
      regex = this.integerUnsigned;
      regexThousandSeparator = this.thousandSeparatorIntegerUnsigned;
    }
    if (!this.allowDecimals && this.allowSign) {
      regex = this.integerSigned;
      regexThousandSeparator = this.thousandSeparatorIntegerSigned;
    }
    if (this.allowDecimals && !this.allowSign) {
      regex = this.decimalUnsigned;
      regexThousandSeparator = this.thousandSeparatorDecimalUnsigned;
    }
    if (this.allowDecimals && this.allowSign) {
      regex = this.decimalSigned;
      regexThousandSeparator = this.thousandSeparatorDecimalSigned;
    }

    // when a numbers begins with a decimal separator,
    // fix it adding a zero in the beginning
    let firstCharacter = value.charAt(0);
    if (firstCharacter == this.decimalSeparator) value = 0 + value;

    // when a numbers ends with a decimal separator,
    // fix it adding a zero in the end
    let lastCharacter = value.charAt(value.length - 1);
    if (lastCharacter == this.decimalSeparator) value = value + 0;

    // test number with regular expression, when
    // number is invalid, replace it with a zero
    let normalTest = regex.test(value);
    let thousandSeparateTest = this.allowThousandSeparator ? regexThousandSeparator.test(value) : false;
    if ((normalTest && value.length > 12) || (thousandSeparateTest && value.length > 15)) {
      e.preventDefault();
      return;
    }
    let valid: boolean = normalTest || thousandSeparateTest;
    if (valid) {
      if (eventType == 'paste') e.clipboardData.setData("text/plain", value.replace(/,/g, ''));
    } else {
      e.preventDefault();
    }
  }

  /**
   * Get key's name
   * @param e
   */
  getName(e): string {
    if (e.key) {
      return e.key;
    } else {
      // for old browsers
      if (e.keyCode && String.fromCharCode) {
        switch (e.keyCode) {
          case 8:
            return "Backspace";
          case 9:
            return "Tab";
          case 27:
            return "Escape";
          case 37:
            return "ArrowLeft";
          case 39:
            return "ArrowRight";
          case 46:
            return "Delete";
          case 188:
            return ",";
          case 190:
            return ".";
          case 109:
            return "-"; // minus in numbpad
          case 173:
            return "-"; // minus in alphabet keyboard in firefox
          case 189:
            return "-"; // minus in alphabet keyboard in chrome
          default:
            return String.fromCharCode(e.keyCode);
        }
      }
    }
  }
}
