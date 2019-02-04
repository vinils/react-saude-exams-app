function FormatToYYYY_MM_DD(date) {
    let month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

function FormatToDD_MM_YY(date) {
    let month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year-2000].join('/');
}

function LoadPrototype() {
    Date.prototype.formatToYYYY_MM_DD = function () {
      return FormatToYYYY_MM_DD (this);
    }

    Date.prototype.formatToDD_MM_YY = function() {
      return FormatToDD_MM_YY(this)
    }
}

export {LoadPrototype, FormatToDD_MM_YY, FormatToYYYY_MM_DD};