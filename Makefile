# Copy all the sources to the lib folder then run tsc.
lib: $(shell find src -type f)
	rm -R lib 2> /dev/null || true 
	mkdir lib
	cp -R -u src/* lib
	./node_modules/.bin/tsc --project .
	chmod +x $@/main.js

# Generate typedoc documentation.
.PHONY: docs
docs: lib
	./node_modules/.bin/typedoc \
	--mode modules \
	--out $@ \
	--tsconfig lib/tsconfig.json \
	--theme minimal lib  \
	--excludeNotExported \
	--excludePrivate && \
	echo "" > docs/.nojekyll
