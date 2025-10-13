# train.py
# Train DistilBERT for URL binary classification

import pandas as pd
from sklearn.model_selection import train_test_split
from datasets import Dataset
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from transformers import Trainer, TrainingArguments

# -----------------------------
# Step 1: Load dataset
# -----------------------------
df = pd.read_csv("malicious_phish.csv")  # columns: 'urls', 'type'

# Rename columns to standard names
df = df.rename(columns={"url": "text", "type": "labels"})

# Split into train/test
train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['labels'])

# Convert to Hugging Face Dataset
train_dataset = Dataset.from_pandas(train_df)
test_dataset = Dataset.from_pandas(test_df)

# -----------------------------
# Step 2: Tokenization
# -----------------------------
tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

def tokenize(batch):
    return tokenizer(batch['text'], padding=True, truncation=True, max_length=128)

train_dataset = train_dataset.map(tokenize, batched=True)
test_dataset = test_dataset.map(tokenize, batched=True)

# Set format for PyTorch
train_dataset.set_format("torch", columns=["input_ids", "attention_mask", "labels"])
test_dataset.set_format("torch", columns=["input_ids", "attention_mask", "labels"])

# -----------------------------
# Step 3: Load model
# -----------------------------
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=2  # binary classification
)

# -----------------------------
# Step 4: Training arguments
# -----------------------------
training_args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=16,
    num_train_epochs=2,
    learning_rate=2e-5,
    weight_decay=0.01,
    save_total_limit=2,
    logging_dir="./logs"
)




# -----------------------------
# Step 5: Metrics
# -----------------------------
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average="binary")
    acc = accuracy_score(labels, preds)
    return {"accuracy": acc, "f1": f1, "precision": precision, "recall": recall}

# -----------------------------
# Step 6: Trainer
# -----------------------------
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics,
)

# -----------------------------
# Step 7: Train
# -----------------------------
trainer.train(resume_from_checkpoint="./results/checkpoint-39000")


# -----------------------------
# Step 8: Save model & tokenizer
# -----------------------------
trainer.save_model("./distilbert_url")
tokenizer.save_pretrained("./distilbert_url")
print("Model and tokenizer saved to ./distilbert_url")
