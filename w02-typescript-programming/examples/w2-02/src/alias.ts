// Two names, one object. Prints: true true
let ticket = { label: "North", checked: false };
const displayTicket = ticket;
ticket.checked = true;
console.log(displayTicket.checked, ticket === displayTicket);
