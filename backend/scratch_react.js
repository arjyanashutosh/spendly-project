const React = require('react');

try {
  React.cloneElement(';');
  console.log("ok");
} catch (e) {
  console.log("error:", e.message);
}
