FROM python:3.13-alpine

ENV PATH="/scripts:${PATH}"

COPY ./requirements.txt /requirements.txt
RUN apk add --update --no-cache --vertual .tmp gcc libc-dev linux-headers
RUN pip install -r /requirements.txt
RUN apk del .tmp
RUN mkdir /app
COPY ./GeoDev-Tools /app
WORKDIR /app
COPY ./sctipts /sctipts
RUN chmod +x /scripts/*
RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/

RUN adduser -D user
RUN chown -R user:user /vol
RUN chmod -R 755 /vol/web
USER user

CMD ["entrypoint.sh"]
