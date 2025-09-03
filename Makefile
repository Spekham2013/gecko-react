
.PHONY: clean build shell run

clean:
	docker image rm spekham2013/gecko-react:master

build:
	docker build -t spekham2013/gecko-react:master .

build-arm:
	docker buildx build --platform linux/arm64 -t spekham2013/gecko-react:master .

shell:
	docker run --rm -it --privileged --env-file ./.env --publish 8000:8000/tcp --entrypoint bash spekham2013/gecko-react:master

run:
	docker run --rm --privileged --env-file ./.env --publish 8000:8000/tcp spekham2013/gecko-react:master
