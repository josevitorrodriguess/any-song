FROM python:latest



ENV PYTHONDONTWRITEBYTECODE=1 
ENV PYTHONUNBUFFERED=1
WORKDIR /app


COPY requirements.txt .


RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


COPY ./src /app/src


EXPOSE 8000


CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]