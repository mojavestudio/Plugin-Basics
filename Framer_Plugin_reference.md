# API Reference

A list of all functions and attributes available on the Framer Plugin API.

## Navigation API

Use the Navigation API to programmatically navigate the UI to a canvas node, a CMS collection item, or a code file. Plugins can optionally select targets, zoom to canvas layers, or focus a specific field in the item editor.

- `navigateTo()`: Navigate the Framer UI to a target by its ID.

## Plugin UI

A set of functions for opening and closing the plugin itself, along with options for setting a specific size. Plugins can also run completely UI-less if desired.

- `closePlugin()`: Close and terminate the plugin.
- `hideUI()`: Hide the plugin window.
- `setMenu()`: Register a global plugin menu.
- `showContextMenu()`: Show a context menu at a given location.
- `showUI()`: Show the plugin window.

## User APIs

Retrieve information about the user interacting with the plugin.

- `getCurrentUser()`: Information about the user that's interacting with the plugin.

### User

A Framer user.

- `apiVersion1Id`: Deprecated; use `id`.
- `avatarUrl`: Full URL of the user's profile picture, if they have one.
- `id`: User's ID, represented as a 64-lowercase-character hexadecimal string.
- `initials`: Two-uppercase-character acronym of the user's name, for when there is no avatar.
- `name`: User's full name.

## Code File API

Allows plugins to create, read, update, and manage code files within a Framer project. A code file exports either overrides or code components.

- `subscribeToOpenCodeFile()`: Subscribe to changes in the Code Editor’s active file.
- `createCodeFile()`: Create a new code file in the project.
- `getCodeFile()`: Get a specific code file by its ID.
- `getCodeFiles()`: Get all code files in the project.
- `subscribeToCodeFiles()`: Subscribe to changes in code files across the project.

### CodeFile

A class representing a code file in a Framer project.

- `navigateTo()`: Get all versions/history of this code file.
- `content`: The current content/source code of the file.
- `exports`: Array of exports available in this code file.
- `getVersions()`: Get all versions/history of this code file.
- `id`: The unique identifier of the code file.
- `lint()`: Run linting on the code file content.
- `name`: The name of the code file (e.g., `MyComponent.tsx`).
- `path`: The file system path of the code file.
- `remove()`: Remove the code file from the project.
- `rename()`: Rename the code file.
- `setFileContent()`: Set the content of the code file.
- `typecheck()`: Run TypeScript type checking on the code file.

### CodeFileExport

Union type representing exports from a code file.

- `insertURL`: URL for inserting the component.
- `isDefaultExport`: Whether this is a default export.
- `name`: Export name.
- `type`: Discriminator for the export.

### CodeFileVersion

Represents a historical version of a code file.

- `createdAt`: The creation timestamp.
- `createdBy`: The user that created this version.
- `getContent()`: Retrieve content for this version.
- `id`: The version identifier.
- `name`: The file name at this version.

## Canvas APIs

Framer provides APIs to interact with the canvas, ranging from directly editing nodes to working with images and drag & drop.

### Traits

Allow you to get or edit node attributes.

- `name`: The name of the node displayed in the layers panel.
- `visible`: Whether the node is visible on the canvas.
- `locked`: Whether the node is locked for editing.
- `backgroundColor`: Background color in RGBA format or as a `ColorStyle` instance.
- `backgroundImage`: Background image asset.
- `backgroundGradient`: Background gradient.
- `opacity`: Opacity of the node.
- `rotation`: Rotation angle in degrees.
- `borderRadius`: Border radius for rounded corners.
- `border`: Border properties.
- `imageRendering`: How images should be rendered when scaled.
- `position`: Positioning behavior of the node.
- `top`: Distance from the top edge when using absolute/fixed positioning.
- `right`: Distance from the right edge when using absolute/fixed positioning.
- `bottom`: Distance from the bottom edge when using absolute/fixed positioning.
- `left`: Distance from the left edge when using absolute/fixed positioning.
- `centerX`: Center anchor position as a percentage.
- `centerY`: Center anchor position as a percentage.
- `width`: Width of the node.
- `height`: Height of the node.
- `minWidth`: Minimum width constraint.
- `maxWidth`: Maximum width constraint.
- `minHeight`: Minimum height constraint.
- `maxHeight`: Maximum height constraint.
- `aspectRatio`: Width-to-height ratio.
- `layout`: Enables stack or grid layout.
- `gap`: Spacing between items in a layout.
- `padding`: Inner spacing of a container with layout.
- `stackDirection`: Direction of items in a stack layout.
- `stackDistribution`: How items are distributed in a stack layout.
- `stackAlignment`: How items are aligned perpendicular to the stack direction.
- `stackWrapEnabled`: Whether items should wrap to the next line.
- `gridColumnCount`: Number of columns in the grid.
- `gridRowCount`: Number of rows in the grid.
- `gridAlignment`: How items are aligned within the grid.
- `gridColumnWidthType`: Type of column width sizing.
- `gridColumnWidth`: Width of grid columns in pixels.
- `gridColumnMinWidth`: Minimum width of grid columns in pixels.
- `gridRowHeightType`: Type of row height sizing.
- `gridRowHeight`: Height of grid rows in pixels.
- `gridItemFillCellWidth`: Whether to fill the grid cell width.
- `gridItemFillCellHeight`: Whether to fill the grid cell height.
- `gridItemHorizontalAlignment`: Horizontal alignment within the grid cell.
- `gridItemVerticalAlignment`: Vertical alignment within the grid cell.
- `gridItemColumnSpan`: Number of columns to span.
- `gridItemRowSpan`: Number of rows to span.
- `svg`: SVG markup content.
- `font`: Font selection for text.
- `inlineTextStyle`: Apply a text style preset.
- `link`: URL or internal page link.
- `linkOpenInNewTab`: Whether to open the link in a new tab.
- `controls`: Property control values for code components.
- `componentIdentifier`: Identifier of the component.
- `componentName`: Name of the component.
- `isVariant`: Whether this is a component variant.
- `isPrimaryVariant`: Whether this is the primary variant.
- `gesture`: Gesture state for component variants.
- `inheritsFromId`: ID of the node this variant inherits from.
- `isBreakpoint`: Whether this is a breakpoint.
- `isPrimaryBreakpoint`: Whether this is the primary breakpoint.
- `path`: URL path for the web page.
- `collectionId`: Collection ID for the web page.

## Drag & Drop

Allow any HTML element to become draggable.

- `DragData`: Represents the data to be dragged.
- `Draggable`: React component that makes its child draggable.
- `onDragComplete()`: Callback triggered when a drag finishes.
- `makeDraggable()`: Allow any HTML element to become draggable.

## CMS APIs

APIs to interact with the CMS. Collections can be user-created (Unmanaged) or controlled by a plugin (Managed). Collection types share similar structures, and plugin authors can choose what works best for their use case.

- `getActiveCollection()`: Retrieve the collection currently active (selected) in the Framer UI.
- `getActiveManagedCollection()`: Retrieve the currently active managed collection from the UI.
- `getCollections()`: Get all collections in the project, both managed and unmanaged.
- `getManagedCollections()`: Retrieve collections that are managed by the current plugin.

### Collection

A collection that is not controlled by a plugin.

- `managedBy`: Who manages the collection.
- `addFields()`: Create new unmanaged collection fields.
- `addItems()`: Add new items to a collection.
- `getFields()`: Fetch all fields in a collection.
- `getItems()`: Retrieve all items within a collection.
- `readonly`: Whether a collection is read-only.
- `removeFields()`: Remove fields from a collection by their IDs.
- `removeItems()`: Remove items from a collection by their IDs.
- `setAsActive()`: Set the collection as active.
- `setFieldOrder()`: Reorder fields based on an array of field IDs.
- `setItemOrder()`: Reorder items based on an array of item IDs.
- `slugFieldBasedOn`: The ID of the field the slug is based on.
- `slugFieldName`: The name of the field used as the slug.

### CollectionItem

Represents a CMS item in a collection or managed collection.

- `navigateTo()`: Navigate the UI to this collection item.
- `fieldData`: The fields and corresponding values of the collection item.
- `id`: Unique identifier for a collection item.
- `remove()`: Remove the item from the collection.
- `setAttributes()`: Set the values of the fields of the CMS item.
- `slug`: Slug value of the CMS item.

### EnumCase

An enum case for an enum field.

- `id`: Unique identifier for the enum case.
- `name`: Name of the enum case.
- `nameByLocale`: Localized values for the name of the enum case.
- `remove`: Remove the enum case.
- `setAttributes`: Update the attributes of the enum case.

### EnumField

An enum field.

- `EnumCase`: Reference to the enum case type.
- `addCase()`: Add an enum case.
- `cases`: The cases of the enum field.
- `setCaseOrder()`: Set the order of the enum field's cases.

### ManagedCollection

A CMS collection controlled by a plugin.

- `addItems()`: Add new items or update existing ones if their IDs match.
- `getFields()`: Get all fields on the collection.
- `getItemIds()`: Retrieve all item IDs in a managed collection.
- `removeItems()`: Remove CMS items by their ID.
- `setAsActive()`: Open this collection in the editor.
- `setFields()`: Add, update, or remove collection fields.
- `setItemOrder()`: Arrange CMS items in a specific order.

## Localization API

Interact with localization functionality. The key pieces are locales, localization groups, and localization sources.

- `getActiveLocale()`: Get the currently active locale.
- `getDefaultLocale()`: Get the default locale of the project.
- `getLocales()`: Get all locales in the project.
- `getLocalizationGroups()`: Get all localization groups in the project.
- `setLocalizationData()`: Update localization data.

### Locale

A locale in your project.

- `code`: Language code of the locale.
- `fallbackLocaleId`: ID of the fallback locale.
- `id`: Unique identifier for a locale.
- `name`: Name of the locale.
- `slug`: Slug value of the locale.

### LocalizationGroup

A group of localization sources.

- `id`: Unique identifier for a localization group.
- `name`: Name of the localization group.
- `sources`: Localization sources in the group.
- `statusByLocale`: Status of the localization group in each locale.
- `supportsExcludedStatus`: Whether a localization group supports the "excluded" status.
- `type`: Type of the localization group.

### LocalizationSource

A localizable string on your site.

- `id`: Unique identifier for a localization source.
- `name`: Name of the localization source.
- `type`: Type of value for the localization source.
- `value`: Current value of the localization source in the default locale.
- `valueByLocale`: Localized values and metadata for each locale.

### LocalizationValue

The localized value and associated metadata for a locale.

- `lastEdited`: Time the localized value was last edited.
- `readonly`: Whether the value is read only and therefore cannot be updated.
- `status`: Status of the localization value.
- `value`: The actual text of the localization value.
- `warning`: Warning about the localization value.

## Settings APIs

Interact with site settings functionality. Redirects, the primary feature supported by these APIs, allow you to permanently route traffic from an old path to a new URL.

- `addRedirects()`: Add redirects to your project.
- `getRedirects()`: Get all redirects in the project.
- `removeRedirects()`: Remove redirects from your project.
- `setRedirectOrder()`: Set the order of the redirects in the list.

### Redirect

A redirect from one path to another.

- `expandToAllLocales`: Whether the redirect is expanded to all locales.
- `from`: The source path of the redirect.
- `id`: Unique identifier for the redirect.
- `remove()`: Remove the redirect.
- `setAttributes()`: Set the attributes of a redirect.
- `to`: The destination path of the redirect.

## Permissions

Plugins can do only what the user can. Use these APIs to check if needed methods are available and disable portions of your plugin if not.

- `isAllowedTo()`: Find out if a user's permissions allow them to execute methods.
- `subscribeToIsAllowedTo()`: Subscribe to changes in whether the user is allowed to execute methods.
- `useIsAllowedTo()`: Hook form for checking if users are allowed to execute methods.

## Modes

Understand the context in which the plugin is running and adjust logic accordingly.

- `mode`: Property with the current mode.

## Project

Information about the current Framer project. Returns the display name of the project as well as a hashed project ID (not usable for access).

- `getProjectInfo()`

## Selection

Functions for reading, setting, or listening to the current selection on the canvas. The returned list can range from zero items to a very large list.

- `getSelection()`
- `setSelection(nodeIds)`
- `subscribeToSelection(callback)`

```ts
const [selection, setSelection] = useState<CanvasNode[]>([])

useEffect(() => {
    return framer.subscribeToSelection(setSelection)
}, [])

console.log(`Selected ${selection.length} item(s)`)
```

## Assets

Functions for working with images, files, and SVGs. High-level add and set functions automatically handle uploading for you.

- `addImage(imageAsset)`
- `setImage(imageAsset)`
- `uploadImage(file)`
- `uploadFile(file)`
- `uploadFiles(files[])`
- `addSvg(svgString)`

## Components

Functions for utilizing components in your plugin. Learn more in the Component guide.

- `addComponentInstance({ url, attributes })`
- `addDetachedComponentLayers({ url, layout, attributes })`

## Text

Functions for working with text layers and their content.

- `getText()`
- `setText(text)`
- `addText(text)`
- `subscribeToText(callback)`

## Custom Code

Install code snippets in a user's website via `<script>` tags. Custom code added by a plugin appears in a dedicated section of the project's site settings and should be valid HTML.

- `setCustomCode(options)`
- `getCustomCode()`
- `subscribeToCustomCode(callback)`

When setting custom code, provide the HTML string and location.

```ts
framer.setCustomCode({
  html: '<script src="https://example.com/script.js"></script>',
  location: 'bodyEnd'
})
```

The `location` property accepts the following values:

- `headStart`: Injects the snippet at the start of the HTML `<head>` tag.
- `headEnd`: Injects the snippet at the end of the HTML `<head>` tag.
- `bodyStart`: Injects the snippet at the start of the `<body>` tag.
- `bodyEnd`: Injects the snippet at the end of the `<body>` tag.

Setting the `html` value back to `null` clears the installed code snippet.

```ts
framer.setCustomCode({
  html: null,
  location: 'bodyEnd'
})
```

## Storing Data

Store data that your plugin can use across users and sessions.

- `getPluginData(key)`
- `setPluginData(key, value)`
- `getPluginDataKeys()`

## Styles

Functions for creating, reading, and manipulating color and text styles in a project.

- `createColorStyle(attributes)`
- `getColorStyle(id)`
- `getColorStyles()`
- `subscribeToColorStyles(callback)`
- `createTextStyle(attributes)`
- `getTextStyle(id)`
- `getTextStyles()`
- `subscribeToTextStyles(callback)`

## Fonts

Plugins can use typefaces available in the font picker to get information about specific fonts or apply them to text styles.

- `getFont(family)`
- `getFonts()`

`getFonts()` lists individual fonts for each weight and style.

```ts
await framer.getFonts()

[
  {
    family: 'Inter',
    weight: 900,
    style: 'normal'
  },
  {
    family: 'Noto Sans',
    weight: 400,
    style: 'normal'
  }
]
```

To get a specific font from a family, use `getFont` and pass the family name (case-insensitive). By default, it returns a font with normal weight and style.

```ts
const font = await framer.getFont('Noto Sans')

const heavyItalic = await framer.getFont('Noto Sans', {
  weight: 800,
  style: 'italic'
})
```

Make sure to check that a font exists before using it. If a font does not exist, `getFont` returns `null`.  
Note: Custom fonts are not available to plugins.

## Editor

Functions for common actions in the Framer editor, like going to a specific node on the canvas or displaying a toast.

- `zoomIntoView(nodeId)`
- `notify(message, options?: NotifyOptions)`

```ts
await framer.zoomIntoView('node-id')
await framer.zoomIntoView(['node-id-1', 'node-id-2'])
```

## Nodes

Low-level API for working with nodes. Useful for specific tasks not covered by higher-level APIs.

- `createFrameNode(attributes)`
- `cloneNode(nodeId)`
- `removeNode(nodeId)`
- `getCanvasRoot()`
- `subscribeToCanvasRoot(callback)`
- `getNode(nodeId)`
- `getParent(nodeId)`
- `getChildren(nodeId)`
- `getRect(nodeId)`
- `setAttributes(nodeId, attributes)`
- `setParent(nodeId, parentId)`
- `getNodesWithType(type)`
- `getNodesWithAttribute(attribute)`
- `getNodesWithAttributeSet(attribute)`
- `node.navigateTo(opts)`
