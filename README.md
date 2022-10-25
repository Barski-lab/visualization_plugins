# Visualization Plugins
Set of utilities for interactive data visualization

## Volcano Plot
Replace the example ***./volcano_plot/html_data/report.tsv*** with your data. The following columns are used: **GeneId**, **log2FoldChange**, **padj**.

## Development
To view the html report and test it's interactivitiy, the html must be served.
Run a python simple http server from within the html_data folder
```bash
cd ./volcano_plot/html_data
# python 3
python -m http.server 8000
```