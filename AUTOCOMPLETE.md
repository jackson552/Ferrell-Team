# Live address autocomplete

The home search includes local suggestions without any external service. To also
enable live street-address and place suggestions, create a public Mapbox token,
restrict it to the site's production and preview URLs, and place it in the
`mapbox-token` meta tag in `index.html`:

```html
<meta name="mapbox-token" content="pk.your-url-restricted-public-token">
```

If the token is empty or Mapbox is unavailable, the search automatically falls
back to the built-in Greater Cincinnati communities, neighborhoods, counties,
school districts, and ZIP codes.
