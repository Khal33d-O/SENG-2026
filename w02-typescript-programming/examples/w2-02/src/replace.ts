// Replace one reference. Prints: South North, then false
let ticket = { label: "North", checked: false };
const displayTicket = ticket;
ticket = { label: "South", checked: true };
console.log(ticket.label, displayTicket.label);
console.log(ticket === displayTicket);
