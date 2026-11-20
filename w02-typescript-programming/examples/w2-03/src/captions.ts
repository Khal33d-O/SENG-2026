// Map keys: a second set replaces the stored value.
const captions = new Map<string, string>();
captions.set("amber", "Waiting");
captions.set("blue", "Ready");
captions.set("blue", "Held");
const label = captions.get("blue");
console.log(label, captions.size); // Held 2
captions.set('q', 'Paused');
console.log(captions.get('q'), captions.has('r'), captions.size);
// q was never set before this line, so get returns Paused, r is absent and the size grows to 3.
