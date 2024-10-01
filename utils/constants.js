export const getYaml = (folderId) => `---
job: extension
config:
  # this name will be the folder and filename name
  name: "${folderId}"
  process:
    - type: 'sd_trainer'
      # root folder to save training sessions/samples/weights
      training_folder: "output"
      # uncomment to see performance stats in the terminal every N steps
      performance_log_every: 1000
      device: cuda:0
      # if a trigger word is specified, it will be added to captions of training data if it does not already exist
      # alternatively, in your captions you can add [trigger] and it will be replaced with the trigger word
#      trigger_word: "p3r5on"
      network:
        type: "lora"
        linear: 64
        linear_alpha: 64
      save:
        dtype: float16 # precision to save
        save_every: 1000 # save every this many steps
        max_step_saves_to_keep: 30 # how many intermittent saves to keep
        push_to_hub: false #change this to True to push your trained model to Hugging Face.
        # You can either set up a HF_TOKEN env variable or you'll be prompted to log-in         
#       hf_repo_id: your-username/your-model-slug
#       hf_private: true #whether the repo is private or public
      datasets:
        # datasets are a folder of images. captions need to be txt files with the same name as the image
        # for instance image2.jpg and image2.txt. Only jpg, jpeg, and png are supported currently
        # images will automatically be resized and bucketed into the resolution specified
        # on windows, escape back slashes with another backslash so
        # "C:\\path\\to\\images\\folder"
        - folder_path: "/home/user/ai-toolkit/${folderId}"
          caption_ext: "txt"
          caption_dropout_rate: 0.05  # will drop out the caption 5% of time
          shuffle_tokens: false  # shuffle caption order, split by commas
          cache_latents_to_disk: true  # leave this true unless you know what you're doing
          resolution: [ 512, 768, 1024 ]  # flux enjoys multiple resolutions
      train:
        batch_size: 1
        steps: 4000  # total number of steps to train 500 - 4000 is a good range
        gradient_accumulation_steps: 1
        train_unet: true
        train_text_encoder: false  # probably won't work with flux
        gradient_checkpointing: true  # need the on unless you have a ton of vram
        noise_scheduler: "flowmatch" # for training only
        optimizer: "adamw8bit"
        lr: 1e-4
        # uncomment this to skip the pre training sample
#        skip_first_sample: true
        # uncomment to completely disable sampling
#        disable_sampling: true
        # uncomment to use new vell curved weighting. Experimental but may produce better results
#        linear_timesteps: true

        # ema will smooth out learning, but could slow it down. Recommended to leave on.
        ema_config:
          use_ema: true
          ema_decay: 0.99

        # will probably need this if gpu supports it for flux, other dtypes may not work correctly
        dtype: bf16
      model:
        # huggingface model name or path
        name_or_path: "black-forest-labs/FLUX.1-dev"
        is_flux: true
        quantize: false  # run 8bit mixed precision
        low_vram: false  # uncomment this if the GPU is connected to your monitors. It will use less vram to quantize, but is slower.
      sample:
        sampler: "flowmatch" # must match train.noise_scheduler
        sample_every: 150 # sample every this many steps
        width: 1024
        height: 1024
        prompts:
          # you can add [trigger] to the prompts here and it will be replaced with the trigger word
#          - "[trigger] holding a sign that says 'I LOVE PROMPTS!'"\
          - "nick man with red hair, playing chess at the park, bomb going off in the background"
          - "nick man holding a coffee cup, in a beanie, sitting at a cafe"
          - "nick man is a DJ at a night club, fish eye lens, smoke machine, lazer lights, holding a martini"
          - "nick man showing off his cool new t shirt at the beach, a shark is jumping out of the water in the background"
          - "nick man building a log cabin in the snow covered mountains"
          - "nick man playing the guitar, on stage, singing a song, laser lights, punk rocker"
          - "nick man man with a beard, building a chair, in a wood shop"
          - "nick man, white background, medium shot, modeling clothing, studio lighting, white backdrop"
          - "nick man holding a sign that says, 'this is a sign'"
        neg: ""  # not used on flux
        seed: 42
        walk_seed: true
        guidance_scale: 4
        sample_steps: 20
# you can add any additional meta info here. [name] is replaced with config name at top
meta:
  name: "[name]"
  version: '1.0'`;