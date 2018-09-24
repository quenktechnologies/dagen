
lib: $(shell find src -name \*.ts)
	mkdir -p $@
	cp -R src/* $@;
	./node_modules/.bin/tsc -p src

.PHONY: clean
clean:
	@rm -R ./lib 2> /dev/null || true

.PHONY: test
test: 
	rm -R ./node_modules/sql; ./node_modules/.bin/tsc --project \
	./test-plugins && cp package.json package.json.old && \
	npm install ./test-plugins &&  \
	mv package.json.old package.json && \
	npm run -s build && ./node_modules/.bin/mocha --opts mocha.opts test

