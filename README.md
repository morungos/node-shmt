# node-shmt
Stuart's Hubspot migration tool

## Some commands:

### list

Lists the pages

```
./cli.js list --api-key <key>
```

### get

Reads the page with slug `/customers/xxx-technologies` and writes the data to standard output,
and thence in UNIX, to a new JSON file `xxx.json`.

```
./cli.js get /customers/xxx-technologies --api-key <key> > xxx.json
```

### create

Attempts to push the data from a page file `xxx.json` up to the server as slug `/xxx`. The
file `url-mapping.csv` is used as a mapping -- all references to any of these strings, anywhere,
even inside string values, will be lifted over to a new string.

The `--dry-run` option stops a server call from being made. Drop it when you want to actually
push the data.

```
./cli.js create /xxx --api-key <key> --data xxx.json --mapping-file url-mapping.csv --dry-run
```