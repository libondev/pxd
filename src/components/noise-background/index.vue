<script setup lang="ts">
import type { NoiseBackgroundProps } from './types'

defineOptions({
  name: 'PNoiseBackground',
})

withDefaults(defineProps<NoiseBackgroundProps>(), { as: 'div' })
</script>

<template>
  <Component :is="as" class="pxd-noise-background relative">
    <slot />
  </Component>
</template>

<style>
.pxd-noise-background::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url('data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCACAAIADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEC/8QAJxAAAQIFBAIDAQEBAAAAAAAAAREhADFBUWFxgZHwobHB0eHxEkL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AtWIVxypWrvitIpeoxpWfwNYXA3mFPbQOZIVZuXT+VeAMfKydfUyQiVgDjfXSuwiLZVXP1rTaxlGlFLBwo/cikBdyxo/3VWdjpCp+2dBb3KdTFkU1+MWoKPEfvxmqE7zgCjCWZh+GCNbG0ssKPkLD2mcz5sIvrpt3xAQ+uBLzb6aB2SSfFbWWJNXzVjcNptYGLr8sjztlMUYIovswGJ3mHYJFCkP6P549NF7qvhesIkmNd9aS0FbwBUU8V/MosjCU0FZo5/nSAYMZtWZaJ6ClXA9PrWAD35MmlyquphMKtNF1bl7RcMyVthBiUKXI80lr6gFTI9UEvw1Fg4coPmWRm14BA1UNM9TECTRP7wozfQwEWSU+KMSt+Jzg7AcioQ9XzQVltWUtTLHKQ1FKler/AGkBa/PG3FofGOHJ77iqJaVxpW8JSE9vnVEwFrAXa3zTF/cH88dP8SJOcxcXlrzAMnrYyyJPQcgqZVuB9Lf8hRv1VTFcha2hdPp0G62xW0oGGtAiXvzhkgLIJUD80o1qxKCiekqqVpS7xZu/NHRhyrJzCg2ndPCIp+TAQWrlb62dC4Ji13bqhcM03nC5LXUMn6yzkkRXSxNqSTqu0AcVQn2vmaLRBFo0xNv4NTIQQMQHwlZ9fEBo+nzq8zzAF3vKgGg11mIMZdCpbHRBn/Z678WSH6ge8ztQpbQAobnshe9II96K1HoicKDiBntRVrbHUm6ZvPh38GAhKB1WWZCUm+YuSeWTxpSdYN43XTcdEPjzL3o3Cgr1KocInXhqSM9CTwuaQabWJFLdO4htxpIogMtJUSAvui+dMRDSf8ex2RLQeTVVtDLT6nAWnd81ykBd/X1WR3jK5oPaZa7yi7qq+PrUPaCFcH6k/MsQB17qj38VnDmSsr7/AGHiBXE/HjVa0pFwh13219UgB13Jk70YU8JDRxa5G3FMVgOuSJ6b6QlZ80I0dwdYAk8NI4y8JXKVLhzqpPaw/XatlfflobhRw5+NnpKAEo5xj3L9SFjdt6KKwZdBhAMzdZpvEWkgBwB5WWEWsBVAJEi1ClHntA2ktmkZ1AunzCTfTHTA4FYMqJPAw3hfUAnygebqbOx9qYJ+ec5t+HpS+9inKQH4GBK1kbz1pAHS03bdXusV/nTHuukZZ7Pu3eAyCCCwHHV1lQwFml70WoTbeIg75HNgGaKvflG8KtBAbCn6JpppSAHepqMdfZ4SrgKWnPpxaCvKnkkBPE/yL2mvdbvAShUULprmSdeCI9pSZthtCdKf9PeqnfSIbPKWPsWVC1YCtVKJeSbI78PDjbeduvOCNW8hbM5/dTE1VnM9nQVtNIC/fS4+ZQrIrKj1co2MwGpUk5RLfXhIIi+JoKdErQAbfnz3WCHrU0FVpXaHxsrKGg4TZStBjejXaAasmUEyN9JQlK96DVJcIqvNPr8fcsRfLTp8DtIB7dPvyFpaJKeVsFc39u0Ga/kD+f14iI+1ZNVKCuywF9Nqq9X+xJIgNFDefk4ijgUQbnD9eFBIYTstpWgFddKDnP5Es6pQKZpyN6JeLPbVjdD7ptCTTfONnLzCLAD5szjca3gxFM8V8RfzVz47KJKlAKydk21eAcIr8aJUDSBZzKciyXQ7qZRDQ3Pw2SPNs6Mr6X/svcBJm3272/kpQsV+iot/WERAQric0u6r84zFMsNaxVaD7tAQBCBZFT3WbA8miXTE6fea5BhwCa8T/OYLJZpt9bwCvfM18bmSwX2KJNd03zBcern5UxAUwDdFk17VoIA5WWWI86fEWoRi7TKLXDre0MNJfQdG4gflf5V+SplAQKgqAm/CyrOTXi0VHa3CqaGbTvBj8LR5htNkWJZAqBDKbJWfVaApszzKYeyS6kRNp08sacl4vPL9ojyhQnVHrJn1+IA7AGj1+suN4JmmXT91tWGzlbT2/cwZJLVGn9+YA0iMOZyPv1tDCvdtEsrpD/WyyaplJk84g2F6/sDakAsu9u2+ICjlZUzvRoiNVEueEDs14rB38/3qwBTdfz3amtYPt62n/UzBKIdZW91CDxDkqofV/OIA11eTX74FoTF1/apdemI0gL3Z1F9kYxX2S59I2iaCAOVo9p7vX8g6hTTcn8bhYX6NZTFlfiG2XvxrLFIBWxShnzZ/iLOujOh74ESokvKJspUtPSJuWptmszJXgLS42XvXiy7fv7GU8E6kbGqrwsKFfktPXpk5gLvOR19ve86xRz9Pi/5ECpmdUn6xCkneWeglavSAmqGdHk9lUzuu0Wrovuvh+ViYIUgKwF5S/dYspDZrvLHu8BHBRQdf7bqmKDu86JcUHKJJJQlNy3i3nGkRih5COmjsuviA1d/y3WiKb+CzLj1BGu3hAnq03gW2pmdXN1FisAC4XAmnfM4UQLJuGdE/cQqfEn/hfeIxAF5lrLzXmABUkgBqLIZLvVItfn1XRfYiBA8wAxqzd+iALJkVedxXbiAfWQ+Hk5lzC2fCgy/CPLxRYTTi1WO3MVyEkt9lbe+NAUyKAptpp7ECiBZFq9pOBGxtdpTkUh974S7nCWgFSnqVd74lWDsjSE1bRU+Ybay18TnWUoSdN2XdDAf/2Q==');
  background-size: 96px 96px;
  background-position: center;
  pointer-events: none;
  opacity: 0.035;
}
</style>
