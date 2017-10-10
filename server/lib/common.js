'use strict'

exports.timestamp = (datetime) => {
  datetime = datetime || new Date()
  return new Intl
    .DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZoneName: 'short'
    })
    .format(new Date(datetime))
}
