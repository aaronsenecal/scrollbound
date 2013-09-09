jQuery scrollBound
===========

Easily control the behavior of any DOM element based on the document's scroll position.

### REQUIREMENTS: ###
- jQuery 1.7

### TO USE: ###
Specify vertical and horizontal scroll trigger rules for any HTML element using a `data-trigger` attribute.

Call the `scrollBound()` method to process a group of selected elements. Elements with the class `scrollbound-ready` will be processed on DOM readiness.

The method can be called with...
- No arguments, filtering out any previously-processed elements, or elements without the `data-trigger` attribute.
- A Trigger Rule, expressed as a string with the syntax described below, applying the new trigger rule to all elements in the set.
- The string `refresh`, which will reprocess the trigger rules for all selected elements.

Trigger Rule syntax is: `[_ or |]::[before, middle or after] [> or <] [CSS Selector]::[before, middle or after]` where...
- `_` represents the viewport's top/bottom boundaries, dictates a vertical scroll trigger.
- `|` represents the viewport's left/right boundaries, dictates a horizontal scroll trigger.
- `::before` specifies `scrollTop`|`scrollLeft` of the document, or the `offsetTop`|`offsetLeft` of the trigger element.
- `::after` specifies `scrollTop`|`scrollLeft` of the document + the window's `innerWidth`|`innerHeight`, or the `offsetTop`|`offsetLeft` + `offsetHeight`|`offsetWidth` of the trigger element.
- `::middle` specifies `scrollTop`|`scrollLeft` of the document + one half of the window's `innerHeight`|`innerWidth`, or `offsetTop`|`offsetLeft` +  half of the `offsetHeight`|`offsetWidth` of the trigger element.
- The CSS selector specified will be filtered to the first in the set of matched elements.

Multiple rules can be added to a single element, seperated by semicolons (`;`). Alternatively, each rule can be assigned a custom handle (affecting the element's class and event names) using the syntax: `:[handle] {[rule]}`.

During the `scroll` and `resize` events bound to the window, rules assigned to elements processed by ScrollBound are evaluated in sequence, according to their appearance in the `data-trigger` string.
- If a rule is evaluated as `true`, the class `[handle]` or `scroll-trigger-i-active` is added to, and the event `[handle]-on` or `scroll-trigger-i-on` is triggered for, the processed element (where `i` is a zero-indexed integer representing the rule's place in the sequence of rules for the element).
- If a rule is evaluated as `false`, the associated class described above is removed and the event `[handle]-off` or `scroll-trigger-i-off` is fired for the processed element.
- The event `scroll-trigger-on` is fired every time a scroll trigger is activated, and `scroll-trigger-off` is fired for every deactivation.
- Any element with at least one trigger active will also have the class `scroll-trigger-active`.
