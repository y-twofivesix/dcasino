#!make
ENV_FILE=.env
include $(ENV_FILE)
export $(shell sed 's/=.*//' ${ENV_FILE})

.PHONY: build_fe
build_fe:
	python3 dev_gen_update_dotenv.py $(DEV_FE_VERSION)
	python3 update_fe_package_json.py $(DEV_FE_NAME) $(DEV_FE_VERSION) $(DEV_AUTHOR)
	make -C frontend generate
	cd frontend && npm i && npm run build



.PHONY: build_be
build_be:
	python3 update_be_cargo_toml.py $(DEV_BE_NAME) $(DEV_BE_VERSION) $(DEV_AUTHOR)
	 make -C backend generate
	 cd backend && cargo build

.PHONY: test_be
test_be:
	 cd backend && cargo test

.PHONY: wasm
wasm:
	 make -C backend build

.PHONY: optim
optim:
	 make -C backend optim

.PHONY: start-server
start-server:
	 make -C backend start-server

.PHONY: stop-server
stop-server:
	 make -C backend stop-server

.PHONY: run_dev
run_dev:
	make build_fe
	npm run dev


