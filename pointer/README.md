# pointer events

If you're using pointer events in interesting ways, you often want to disable the browser's default handling.

This will disable the text selection:

```css
#someElement {
  user-select: none;
  -webkit-user-select: none;
}
```

You might also want to [change the cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor):

```css
#someElement {
  cursor: crosshair;
}
```

Other useful values for `cursor` are: _none, grab, grabbing, pointer_ (typically a hand icon with) and _move_.

Browsers often have a kinetic 'overscroll' that give an elastic sort of behaviour when scrolling an element. This can be disabled with [`overscroll-behaviour`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior). When applied to the BODY element this disables the pull-to-refresh interaction on Chrome.

```css
body {
  overscroll-behavior: none;
}
``` 

Gestures such as panning and zooming can be disabled with [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action).

```csss
body {
  touch-action: none;
}
```

## Zooming

To remove default pinch zooming, add this to the HTML's HEAD:

```html
<meta name="viewport" content="width=device-width, user-scalable=no">
```

ie: 

```html
<html>
<head>
  <meta name="viewport" content="width=device-width, user-scalable=no">
  ...
</head>
<body>
   ...
</body>
</html>
```

Add `touch-action: none` to your CSS as well.

It may also be necessary to intercept `mousewheel` events for desktop browsers:

```js
document.addEventListener(`wheel`, evt => {
  evt.preventDefault();
}, { passive:false });
```

# Snippet

Here is a snippet which neuters most of the default behaviour for all elements:

```css
*,
*:before,
*:after {
  touch-action: none;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
body {
  overscroll-behavior: none;
}
```