# Lumafold

A structured note-taking browser extension organizing thoughts across folders and multi-panel editor columns.

## Language

**Folder**:
A named container displayed in the top tab row that holds an independent set of panels.
_Avoid_: Category, project, directory, notebook

**Panel**:
A vertical text column within an active folder hosting a rich text editor.
_Avoid_: Card, sub-folder, window, split, pane

**Chrome**:
The peripheral application interface encompassing the top tab row, utility controls, and pane dividers.
_Avoid_: Shell, header, nav

**Popup Mode**:
The compact extension popup viewport running constrained within the browser's action flyout (800×600).
_Avoid_: Widget mode, mini mode, popup window

**Tab Mode**:
The expansive workspace view running within a full browser tab.
_Avoid_: Fullscreen mode, desktop mode, web mode

**Bubble Menu**:
A contextual formatting toolbar that appears transiently over selected text in an active editor panel.
_Avoid_: Floating modal, selection popup, hover bar, format dialog

**Surface**:
A semantic background elevation tier (`surface-0` for root chrome, `surface-1` for editor canvas, `surface-2` for interactive popovers and hover states).
_Avoid_: Layer, background level, card background

**Hairline Divider**:
A 1px vertical column boundary separating multi-panel columns that supports click-and-drag width adjustments.
_Avoid_: Splitter, separator bar, gutter, card border
