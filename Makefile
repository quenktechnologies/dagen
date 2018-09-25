
lib: $(shell find src -name \*.ts)
	mkdir -p $@
	cp -R src/* $@;
	./node_modules/.bin/tsc -p src

.PHONY: clean
clean:
	@rm -R ./lib 2> /dev/null || true

.PHONY: test
test: 
	./node_modules/.bin/mocha --opts mocha.opts test/unit && \
	./node_modules/.bin/mocha --opts mocha.opts test/feat

