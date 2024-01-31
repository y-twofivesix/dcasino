#!make
ENV_FILE=../.env
include $(ENV_FILE)
export $(shell sed 's/=.*//' ${ENV_FILE})


.PHONY: check
check:
	cargo check

.PHONY: clippy
clippy:
	cargo clippy

.PHONY: unit-test
unit-test:
	cargo unit-test

# This is a local build with debug-prints activated. Debug prints only show up
# in the local development chain (see the `start-server` command below)
# and mainnet won't accept contracts built with the feature enabled.
.PHONY: build _build
build: _build compress-wasm
_build:
	RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown

.PHONY: compress-wasm
compress-wasm:
	cp ./target/wasm32-unknown-unknown/release/*.wasm ./contract.wasm
	@## The following line is not necessary, may work only on linux (extra size optimization)
	@# wasm-opt -Os ./contract.wasm -o ./contract.wasm
	cat ./contract.wasm | gzip -9 > ./contract.wasm.gz

.PHONY: schema
schema:
	cargo run --example schema

# Run local development chain with four funded accounts (named a, b, c, and d)
.PHONY: start-server
start-server: # CTRL+C to stop
	docker run -it -d --rm \
		-p 9091:9091 -p 26657:26657 -p 26656:26656 -p 1317:1317 -p 5000:5000 \
		-v $$(pwd):/root/code \
		--name secretdev ghcr.io/scrtlabs/localsecret:v1.6.0-rc.3

.PHONY: stop-server
stop-server:
		docker kill secretdev


.PHONY: clean
clean:
	cargo clean
	-rm -f ./contract.wasm ./contract.wasm.gz

.PHONY: optim
optim:
	sudo docker run --rm -v $$(pwd):/contract   \
	--mount type=volume,source=$$(basename $$(pwd))_cache,target=/code/target  \
	--mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
	enigmampc/secret-contract-optimizer

.PHONY: generate
generate:
	python3 gen_scripts/be_gen_state_rs.py \
		$(DEV_BE_VERSION) \
		$(DEV_GEN_SU) \
		${DEV_VALIDATOR} \
		${SILK_CONTRACT} \
		${SILK_CODE_HASH} \
		${SSCRT_CONTRACT} \
		${SSCRT_CODE_HASH}

.PHONY: dev_build
dev_build:
	make generate
	cargo build
